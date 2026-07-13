package fr.epita.assistants.ping.domain.service;

import fr.epita.assistants.ping.api.request.UpdateProjectRequest;
import fr.epita.assistants.ping.api.response.ProjectResponse;
import fr.epita.assistants.ping.api.response.RoleResponse;
import fr.epita.assistants.ping.api.response.UserResponse;
import static fr.epita.assistants.ping.utils.ProjectModelToResponse.toResponse;

import fr.epita.assistants.ping.data.model.ProjectModel;
import fr.epita.assistants.ping.data.model.UserModel;
import fr.epita.assistants.ping.data.repository.ProjectRepository;
import fr.epita.assistants.ping.data.repository.UserRepository;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import fr.epita.assistants.ping.utils.ProjectModelToResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ProjectService {

    @Inject
    ProjectRepository projectRepository;

    @Inject
    UserRepository userRepository;

    public boolean isIn(String project, String login){
        System.out.println(project + " + " + login);
        boolean in = projectRepository.isIn(UUID.fromString(project), login);
        return in;
    }

    public UserModel getUserbyId(String id){
        return userRepository.findUser(UUID.fromString(id));
    }

    public List<ProjectResponse> getAllProjects() {

        List<ProjectModel> projects = projectRepository.listAll();
        return projects.stream()
                .map(ProjectModelToResponse::toResponse)
                .toList();
    }

    public List<ProjectResponse> findProjects(String userID, boolean onlyOwned)
    {
        UserModel user = getUserbyId(userID);
        List<ProjectModel> projects;
        if (onlyOwned) {
            projects = projectRepository.findProjectsByOwner(user);
        } else {
            projects = projectRepository.findProjectsByMember(user);
        }
        return projects.stream().map(ProjectModelToResponse::toResponse).toList();
    }

    public Response createProject(String projectName, String userID, String projectDefaultPath)
    {
        UserModel owner = userRepository.findUser(UUID.fromString(userID));
        if (owner == null) {
            Logger.warn("User not found for id: " + userID);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new ErrorInfo("Not Authorized")).build();
        }
        Logger.projectAction(owner.id.toString(), "NEW", "CREATE_ATTEMPT", "Name: " + projectName);

        ProjectModel project = projectRepository.createProject(projectName, projectDefaultPath, owner);
        try {
            Files.createDirectories(Paths.get(project.getPath()));
        }
        catch (IOException e) {
            Logger.error("Failed to create project : " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new ErrorInfo("Internal Server Error"))
                    .build();
        }
        projectRepository.addMember(project.getId(), owner);
        Logger.projectAction(owner.id.toString(), project.id.toString(), "CREATED",
                "Project created at: " + project.path);
        ProjectResponse response = toResponse(project);
        return Response.status(200).entity((response)).build();
    }

    public Response updateProject(UUID projectId, String currentUserId, UpdateProjectRequest request) {
        UserModel currentUser = userRepository.findUser(UUID.fromString(currentUserId));
        if (currentUser == null) {
            Logger.warn("User not found for id: " + currentUserId);
            return Response.status(401)
                    .entity(new ErrorInfo("Not Authorized")).build();
        }

        ProjectModel project = projectRepository.findProject(projectId);
        if (project == null) {
            Logger.warn("Project not found: " + projectId);
            return Response.status(404)
                    .entity(new ErrorInfo("Project not Found")).build();
        }

        boolean isOwner = project.getOwner().getId().equals(currentUser.getId());
        if (!isOwner && !currentUser.getIsAdmin()) {
            Logger.warn("Unauthorized update attempt - User: " + currentUser.getId() + ", Project: " + projectId);
            return Response.status(403)
                    .entity(new ErrorInfo("Unauthorized update attempt to access project")).build();
        }

        if ((request.getName() == null || request.getName().trim().isEmpty()) && request.getNewOwnerId() == null) {
            Logger.warn("Both name and newOwnerId are null in update request");
            return Response.status(400)
                    .entity(new ErrorInfo("Not Authorized")).build();
        }


        boolean projectModified = false;

        if (request.getName() != null &&  !request.getName().trim().isEmpty()) {
            if (!request.getName().equals(project.getName())) {
                projectModified = true;
                Logger.info("Project name updated from '" + project.getName() + "' to '" + request.getName() + "'");
            } else {
                Logger.info("Project name unchanged - already '" + request.getName() + "'");
            }
        }

        if (request.getNewOwnerId() != null) {
            UserModel newOwner = userRepository.findUser(request.getNewOwnerId());
            if (newOwner != null) {
                if (newOwner != project.getOwner()) {
                    boolean newOwnerIsMember = project.getMembers().stream().anyMatch(m -> m.getId().equals(newOwner.getId()));
                    if (!newOwnerIsMember) {
                        Logger.warn("New owner is not a member of the project: " + request.getNewOwnerId());
                        return Response.status(404)
                                .entity(new ErrorInfo("New owner is not a member of the project !")).build();
                    }

                    projectModified = true;
                    Logger.info("Project owner updated from " + project.getOwner().getId() + " to " + newOwner.getId());
                }
            }
            else
            {
                Logger.warn("New owner not found: " + request.getNewOwnerId());
                return Response.status(404)
                        .entity(new ErrorInfo("New owner not found")).build();
            }
        }


        ProjectResponse result;

        if (projectModified) {
            ProjectModel newProject = projectRepository.updateProject(projectId, request.getName(), userRepository.findUser(request.getNewOwnerId()));
            result = toResponse(newProject);
        } else {
            Logger.projectAction(currentUser.getId().toString(), projectId.toString(), "UPDATE", "No changes - all values identical to current");
            result = toResponse(project);
        }
        return Response.status(200).entity((result)).build();

    }


    public ProjectModel addMember(UUID id, UserModel member){
        return projectRepository.addMember(id, member);
    }

    public boolean exists(String project){
        return projectRepository.findProject(UUID.fromString(project)) != null;
    }


    public Response findUserRole(UUID currentUserId, UUID projectID)
    {
        ProjectModel stocks = projectRepository.findProject(projectID);
        if (stocks == null)
        {
            return Response.status(404).entity(new ErrorInfo("Project not found !")).build();
        }


        UserModel user = userRepository.findUser(currentUserId);

        if (user == null)
        {
            return Response.status(404).entity(new ErrorInfo("User not found !")).build();
        }
        int tier = 0;
        if (user.getIsAdmin() || stocks.getOwner().equals(user))
        {
            tier = 2;
        }
        else if (stocks.getMembers().contains(user))
        {
            tier = 1;
        }
        Logger.info("user "+ user.getDisplayName() + " was identified as tier " + tier + " .");
        return Response.ok(new RoleResponse().withRole(tier)).build();
    }

}
