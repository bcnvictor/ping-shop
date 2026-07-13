    package fr.epita.assistants.ping.presentation.rest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


import static fr.epita.assistants.ping.utils.ProjectModelToResponse.toResponse;
import static org.apache.commons.io.FileUtils.deleteDirectory;
import fr.epita.assistants.ping.data.model.*;
import fr.epita.assistants.ping.data.repository.*;
import fr.epita.assistants.ping.api.request.*;
import fr.epita.assistants.ping.api.response.*;
import fr.epita.assistants.ping.domain.service.ProjectService;
import fr.epita.assistants.ping.utils.*;
import io.quarkus.security.Authenticated;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Context;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import jakarta.annotation.security.RolesAllowed;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;


@Path("/api/projects")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProjectResource {

    @Inject
    ProjectService projectService;

    @Inject
    JsonWebToken jwt;

    @Inject
    ProjectRepository projectRepository;

    @Inject
    UserRepository userRepository;

    @Context
    SecurityContext securityContext;

    @ConfigProperty(name="PROJECT_DEFAULT_PATH", defaultValue="/var/www/projects/")
    String projectDefaultPath;


    @GET
    @RolesAllowed({"admin", "user"})
    public Response getProjects( @QueryParam("onlyOwned") @DefaultValue("false") boolean onlyOwned)
    {
        String userID = jwt.getSubject();
        UserModel user = projectService.getUserbyId(userID);
        if (user == null) {
            Logger.error("User not found for ID: " + userID);
            Logger.warn("User not found for login: " + userID);
            return Response
                    .status(401)
                    .entity(new ErrorInfo("Not Authorized")).build();
        }
        Logger.userAction(userID, "LIST_PROJECTS", "OnlyOwned: " + onlyOwned);
        List<ProjectResponse> projects =  projectService.findProjects(userID,onlyOwned);
        Logger.info("User " + userID + " retrieved " + projects.size() + " projects");
        return Response.ok(projects).build();

    }


    @POST
    @RolesAllowed({"admin", "user"})
    public Response createProjects(CreateProjectRequest request) {
        String userID = jwt.getSubject();
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            Logger.error("Invalid project name: " + request.getName());
            Logger.warn("Invalid project name: " + request.getName());
            return Response.status(400).entity(new ErrorInfo("The project name is invalid (null or empty for example)")).build();
        }
        return projectService.createProject(request.getName(),userID, projectDefaultPath);
    }

    @GET
    @Path("/all")
    @Authenticated
    public Response getAllProjects() {

        String userId = jwt.getSubject();
        Logger.userAction(userId, "GET ALL PROJECTS", "User " + userId + " is fetching all projects");
        List<ProjectResponse> projects = projectService.getAllProjects();
        Logger.userAction(userId, "GET ALL PROJECTS", "User " + userId + " fetched " + projects.size() + " PROJECTS");
        return Response.ok(projects).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed({"admin", "user"})
    public Response updateProject(@PathParam("id") String id, UpdateProjectRequest request) {
        String userId = jwt.getSubject();
        Logger.projectAction(userId, id, "UPDATE_ATTEMPT", "User attempting to update project");
        UUID projectId;
        try {
            projectId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Logger.error("Invalid UUID format for project ID: " + id);
            return Response
                    .status(400)
                    .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                    .build();
        }
        return projectService.updateProject(projectId, userId, request);
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "user"})
    public Response getProject(@PathParam("id") String id) {
        try {
            String userID = jwt.getSubject();
            UserModel user = projectService.getUserbyId(userID);

            if (user == null) {
                Logger.error("User not found for ID: " + userID);
                Logger.warn("User not found for login: " + userID);
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(new ErrorInfo("Not Authorized"))
                        .build();
            }

            UUID projectId;
            try {
                projectId = UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                Logger.error("Invalid UUID format for project ID: " + id);
                return Response
                        .status(400)
                        .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                        .build();
            }

            ProjectModel project = projectRepository.findProject(projectId);
            if (project == null) {
                Logger.error("Unauthorized access - User: " + user.id + ", Project: " + id);
                Logger.warn("Unauthorized access - User: " + user.id + ", Project: " + id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("Project not found"))
                        .build();
            }

            boolean isMember = project.members.stream().anyMatch(m -> m.id.equals(user.id));
            if (!isMember && !user.isAdmin) {
                Logger.error("Unauthorized access - User: " + user.id + ", Project: " + id);
                Logger.warn("Unauthorized access - User: " + user.id + ", Project: " + id);
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ErrorInfo("The user is not allowed to access the project"))
                        .build();
            }

            Logger.projectAction(user.id.toString(), id, "VIEW", "Project accessed");
            return Response.ok(toResponse(project)).build();

        } catch (RuntimeException e) {
            Logger.error("Failed to get project: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorInfo("Internal Server Error"))
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed({"admin", "user"})
    @Transactional
    public Response deleteProject(@PathParam("id") String id) {
        try {
            String userID = jwt.getSubject();
            UserModel user = projectService.getUserbyId(userID);

            if (user == null) {
                Logger.error("User not found for ID: " + userID);
                Logger.warn("User not found for login: " + userID);
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(new ErrorInfo("Not Authorized"))
                        .build();
            }

            UUID projectId;
            try {
                projectId = UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                Logger.error("Invalid UUID format for project ID: " + id);
                return Response
                        .status(400)
                        .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                        .build();
            }

            Logger.projectAction(user.id.toString(), id, "DELETE_ATTEMPT", "Starting deletion");

            ProjectModel project = projectRepository.findProject(projectId);
            if (project == null) {
                Logger.error("Project not found for deletion: " + id);
                Logger.warn("Project not found for deletion: " + id);
                return Response.status(404)
                        .entity(new ErrorInfo("The project could not be found"))
                        .build();
            }

            boolean isOwner = project.owner.id.equals(user.id);

            if (!isOwner && !user.isAdmin) {
                Logger.error("Unauthorized delete - User: " + user.id + ", Project: " + id);
                Logger.warn("Unauthorized delete - User: " + user.id + ", Project: " + id);
                return Response.status(403)
                        .entity(new ErrorInfo("The user is not allowed to access the project"))
                        .build();
            }

            deleteDirectory(new File(project.path));
            projectRepository.delete(project);

            Logger.projectAction(user.id.toString(), id, "DELETED", "Project deleted permanently");
            return Response.status(204).entity("The project was deleted").build();

        } catch (IOException | RuntimeException e) {
            Logger.error("Failed to delete project directory: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorInfo("Failed to delete project directory"))
                    .build();
        }
    }


    @POST
    @Path("/{id}/add-user")
    @RolesAllowed({"admin", "user"})
    @Transactional
    public Response addUser(@PathParam("id") String id, ManageUserRequest request) {
        try {
            String username = securityContext.getUserPrincipal().getName();
            UserModel currentUser = projectService.getUserbyId(username);

            if (currentUser == null) {
                Logger.error("User not found for login: " + username);
                Logger.warn("User not found for login: " + username);
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(new ErrorInfo("Not Authorized"))
                        .build();
            }

            if (request.getUserId() == null) {
                Logger.error("UserId is null in add user request");
                Logger.warn("UserId is null in add user request");
                return Response.status(400)
                        .entity(new ErrorInfo("The userId is invalid (null or empty for example)"))
                        .build();
            }

            UUID projectId;
            try {
                projectId = UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                Logger.error("Invalid UUID format for project ID: " + id);
                return Response
                        .status(400)
                        .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                        .build();
            }

            ProjectModel project = projectRepository.findProject(projectId);
            if (project == null) {
                Logger.error("Project not found: " + id);
                Logger.warn("Project not found: " + id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("The project, or the user could not be found"))
                        .build();
            }

            boolean isMember = project.members.stream().anyMatch(u -> u.id.equals(currentUser.id));
            if (!isMember && !currentUser.isAdmin) {
                Logger.error("Unauthorized access - User: " + currentUser.id + ", Project: " + id);
                Logger.warn("Unauthorized access - User: " + currentUser.id + ", Project: " + id);
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ErrorInfo("The user is not allowed to access the project "))
                        .build();
            }

            UserModel userToAdd = userRepository.findUser(request.getUserId());
            if (userToAdd == null) {
                Logger.error("User to add not found: " + request.getUserId());
                Logger.warn("User to add not found: " + request.getUserId());
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("The project, or the user could not be found"))
                        .build();
            }

            if (project.members.contains(userToAdd)) {
                Logger.error("User already in project: " + request.getUserId());
                Logger.warn("User already in project: " + request.getUserId());
                return Response.status(409)
                        .entity(new ErrorInfo("The user is already a member of the project"))
                        .build();
            }

            projectRepository.addMember(projectId, userToAdd);
            Logger.projectAction(currentUser.id.toString(), id, "ADD_MEMBER", "Added user: " + userToAdd.id);
            return Response.status(204).build();

        } catch (RuntimeException e) {
            Logger.error("Failed to add user: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorInfo("Internal Server Error"))
                    .build();
        }
    }

    @POST
    @RolesAllowed({"admin", "user"})
    @Path("/{id}/exec")
    public Response execFeature(ExecRequest request, @PathParam("id") String id) {
        if(!projectService.isIn(id, jwt.getSubject())){
            Logger.error("Unauthorized exec access - User: " + jwt.getSubject() + ", Project: " + id);
            return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project")).build();
        }

        UUID projectId;
        try {
            projectId = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Logger.error("Project not found for exec: " + id);
            return Response
                    .status(400)
                    .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                    .build();
        }

        ProjectModel project = projectRepository.findProject(projectId);
        if (project == null) {
            return Response.status(404).entity(new ErrorInfo("The project could not be found")).build();
        }
        String repoDir = Paths.get(projectDefaultPath, projectId.toString()).toString();
        if (Objects.equals(request.getFeature(), "git")){
            switch (request.getCommand()) {
                case "init" -> {
                    if (GitTool.init(repoDir)) {
                        Logger.gitCommand(jwt.getSubject(), id, "init", "");
                        return Response.status(204).build();
                    }
                    Logger.error("Git init failed for project: " + id);
                    return Response.status(401).entity(new ErrorInfo("Not Authorized")).build();
                }
                case "commit" -> {
                    String commitMessage = String.join(" ", request.getParams());
                    if (GitTool.commit(repoDir, commitMessage, id, jwt.getSubject())) {
                        Logger.gitCommand(jwt.getSubject(), id, "commit", commitMessage);
                        return Response.status(204).build();
                    }
                    Logger.error("Git commit failed for project: " + id);
                    return Response.status(401).entity(new ErrorInfo("Not Authorized")).build();
                }
                case "add" -> {
                    for (String param : request.getParams()) {
                        if (!GitTool.addFile(repoDir, param, id, jwt.getSubject(), String.join(", ", request.getParams()))) {
                            Logger.error("Git add failed for file: " + param + " in project: " + id);
                            return Response.status(401).entity(new ErrorInfo("Not Authorized")).build();
                        }
                    }
                    Logger.gitCommand(jwt.getSubject(), id, "add", String.join(", ", request.getParams()));
                    return Response.status(204).build();
                }
                case null, default -> {
                    return Response.status(400).entity(new ErrorInfo("Any parameter of the request is invalid (null or non-existent feature)")).build();
                }
            }
        }
        return Response.status(400)
                .entity(new ErrorInfo("Any parameter of the request is invalid (null or non-existent feature)"))
                .build();
    }

    @POST
    @Path("/{id}/remove-user")
    @RolesAllowed({"admin", "user"})
    @Transactional
    public Response removeUser(@PathParam("id") String id, ManageUserRequest request) {
        try {

            String userID = jwt.getSubject();
            UserModel currentUser = projectService.getUserbyId(userID);

            if (currentUser == null) {
                Logger.error("User not found for ID: " + userID);
                Logger.warn("User not found for login: " + userID);
                return Response.status(Response.Status.UNAUTHORIZED)
                        .entity(new ErrorInfo("Not Authorized"))
                        .build();
            }

            if (request.getUserId() == null) {
                Logger.error("UserId is null in remove user request");
                Logger.warn("UserId is null in remove user request");
                return Response.status(400)
                        .entity(new ErrorInfo("The userId is invalid (null or empty for example)"))
                        .build();
            }

            UUID projectId;
            try {
                projectId = UUID.fromString(id);
            } catch (IllegalArgumentException e) {
                Logger.error("Invalid UUID format for project ID: " + id);
                return Response
                        .status(400)
                        .entity(new ErrorInfo("Invalid project ID format. Expected UUID format."))
                        .build();
            }

            ProjectModel project = projectRepository.findProject(projectId);
            if (project == null) {
                Logger.error("Project not found: " + id);
                Logger.warn("Project not found: " + id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("Project not found"))
                        .build();
            }

            boolean isOwner = project.owner.id.equals(currentUser.id);
            if (!isOwner && !currentUser.isAdmin) {
                Logger.error("Unauthorized remove user - User: " + userID + ", Project: " + id);
                Logger.warn("Unauthorized remove user - User: " + userID + ", Project: " + id);
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ErrorInfo("The user is not allowed to access the project, or the user to remove the owner of the project"))
                        .build();
            }

            if (request.getUserId().equals(project.owner.id)) {
                Logger.error("Attempt to remove owner from project: " + id);
                Logger.warn("Attempt to remove owner from project: " + id);
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(new ErrorInfo("The user is not allowed to access the project, or the user to remove the owner of the project")).build();
            }

            UserModel userToRemove = userRepository.findUser(request.getUserId());
            if (userToRemove == null) {
                Logger.error("User to remove not found: " + request.getUserId());
                Logger.warn("User to remove not found: " + request.getUserId());
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("The user is not allowed to access the project, or the user to remove the owner of the project"))
                        .build();
            }

            if (!projectService.isIn(id,userID))
            {
                Logger.error("User to remove not in project: " + request.getUserId());
                Logger.warn("User to remove not in project: " + request.getUserId());
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(new ErrorInfo("The user is not allowed to access the project, or the user to remove the owner of the project"))
                        .build();
            }

            projectRepository.removeMember(projectId, userToRemove);
            Logger.projectAction(currentUser.id.toString(), id, "REMOVE_MEMBER", "Removed user: " + request.getUserId());
            return Response.status(204).entity("User removed from project").build();

        } catch (RuntimeException e) {
            Logger.error("Failed to remove user: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorInfo("Internal Server Error"))
                    .build();
        }
    }

    @POST
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/role")
    public Response getUserRole(RoleRequest roleRequest) 
    {
        String id = jwt.getSubject();
        UUID userUuid;
        try {
            userUuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Logger.error("Invalid UUID format for user ID in delete: " + id);
            return Response
                    .status(400)
                    .entity(new ErrorInfo("Invalid user ID format. Expected UUID format."))
                    .build();
        }
        
        return projectService.findUserRole(userUuid,roleRequest.getProjectID());
    }
}