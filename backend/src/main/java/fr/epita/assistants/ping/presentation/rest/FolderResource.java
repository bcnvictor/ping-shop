package fr.epita.assistants.ping.presentation.rest;

import fr.epita.assistants.ping.api.request.CreateFileRequest;
import fr.epita.assistants.ping.api.request.MoveRequest;
import fr.epita.assistants.ping.api.response.FileResponse;
import fr.epita.assistants.ping.domain.service.FolderService;
import fr.epita.assistants.ping.domain.service.ProjectService;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.io.IOException;
import java.util.List;

@Path("/api/projects/{projectId}/folders")
public class FolderResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    FolderService folderService;

    @Inject
    ProjectService projectService;

    @GET
    @RolesAllowed({"admin", "user"})
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProjectFolders(@PathParam("projectId") String projectId, @QueryParam("path") String path) {
        if(path == null){
            path = "";
        }
        Logger.fileSystemAction(jwt.getSubject(), projectId, "LIST_FOLDERS", path);
        if (!projectService.isIn(projectId,jwt.getSubject()) || path.contains("../") || path.contains("..\\")) { // Add check on projectId if doesn't work
            Logger.error("Unauthorized access or path traversal attempt - User: " + jwt.getSubject() + ", Project: " + projectId + ", Path: " + path);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
        List<FileResponse> files = folderService.getChildren(projectId, path);
        if (files == null){
            Logger.error("Project or path not found - Project: " + projectId + ", Path: " + path);
            return Response.status(404).entity(new ErrorInfo("The project or the relative path could not be found")).build();
        }
        Logger.fileSystemAction(jwt.getSubject(), projectId, "LIST_FOLDERS_SUCCESS", path + " (" + files.size() + " items)");
        return Response.status(200).entity(files).build();
    }

    @DELETE
    @RolesAllowed({"admin", "user"})
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteProjectFolders(CreateFileRequest request, @PathParam("projectId") String projectId) {
        String path = request.getRelativePath();
        Logger.fileSystemAction(jwt.getSubject(), projectId, "DELETE_FOLDER_ATTEMPT", path);
        if(path == null) {
            Logger.error("Invalid relative path in delete folder request - Project: " + projectId);
            return Response.status(400).entity(new ErrorInfo("The relative path is invalid (null or empty for example")).build();
        }
        if (!projectService.isIn(projectId,jwt.getSubject())) { // Add check on projectId if doesn't work
            Logger.error("Unauthorized access or path traversal attempt in delete - User: " + jwt.getSubject() + ", Project: " + projectId + ", Path: " + path);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
        int status = folderService.deleteFolder(projectId,path);
        if (status == 0){
            Logger.fileSystemAction(jwt.getSubject(), projectId, "DELETE_FOLDER_SUCCESS", path);
            return Response.status(204).build();
        }
        else if (status == 1){
            Logger.error("Project or folder not found for deletion - Project: " + projectId + ", Path: " + path);
            return Response.status(404).entity(new ErrorInfo("The project or the folder could not be found")).build();
        }
        else {
            Logger.error("Unauthorized access or path traversal attempt in delete - User: " + jwt.getSubject() + ", Project: " + projectId + ", Path: " + path);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
    }

    @POST
    @RolesAllowed({"admin", "user"})
    @Produces(MediaType.APPLICATION_JSON)
    public Response createProjectFolders(CreateFileRequest request, @PathParam("projectId") String projectId) {
        if (!projectService.exists(projectId)) {
            Logger.error("Project not found for folder creation: " + projectId);
            return Response.status(404).entity(new ErrorInfo("The project could not be found")).build();
        }
        String path = request.getRelativePath();
        Logger.fileSystemAction(jwt.getSubject(), projectId, "CREATE_FOLDER_ATTEMPT", path);
        if(path == null || path.isEmpty()) {
            Logger.error("Invalid relative path in create folder request - Project: " + projectId);
            return Response.status(400).entity(new ErrorInfo("The relative path is invalid (null or empty for example")).build();
        }
        if (!projectService.isIn(projectId,jwt.getSubject()) || path.contains("../") || path.contains("..\\")) { // Add check on projectId if doesn't work
            Logger.error("Unauthorized access or path traversal attempt in create - User: " + jwt.getSubject() + ", Project: " + projectId + ", Path: " + path);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
        if (folderService.createFolder(projectId,path)){
            Logger.fileSystemAction(jwt.getSubject(), projectId, "CREATE_FOLDER_SUCCESS", path);
            return Response.status(201).build();
        }
        else{
            Logger.error("Folder already exists - Project: " + projectId + ", Path: " + path);
            return Response.status(409).entity(new ErrorInfo("The folder already exists")).build();
        }

    }

    @PUT
    @RolesAllowed({"admin", "user"})
    @Path("/move")
    @Produces(MediaType.APPLICATION_JSON)
    public Response moveProjectFolders(MoveRequest request, @PathParam("projectId") String projectId) {
        String src = request.getSrc();
        String dst = request.getDst();
        Logger.fileSystemAction(jwt.getSubject(), projectId, "MOVE_FOLDER_ATTEMPT", src + " -> " + dst);
        if(src == null || src.isEmpty() || dst == null || dst.isEmpty()) {
            Logger.error("Invalid source or destination path in move folder - Project: " + projectId + ", Src: " + src + ", Dst: " + dst);
            return Response.status(400)
                    .entity(new ErrorInfo("The source or destination path is invalid (null or empty for example)"))
                    .build();
        }
        if (!projectService.isIn(projectId, jwt.getSubject())){ // Add check on projectId if doesn't work
            Logger.error("Unauthorized access or path traversal attempt in move - User: " + jwt.getSubject() + ", Project: " + projectId + ", Src: " + src + ", Dst: " + dst);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
        int status = folderService.moveFolder(projectId,src,dst);
        if (status == 0){
            Logger.fileSystemAction(jwt.getSubject(), projectId, "MOVE_FOLDER_SUCCESS", src + " -> " + dst);
            return Response.status(204).build();
        }
        else if (status == 2){
            Logger.error("Project or source folder not found for move - Project: " + projectId + ", Src: " + src + ", Dst: " + dst);
            return Response.status(404)
                    .entity(new ErrorInfo("The project could not be found or the source folder could not be found"))
                    .build();
        }
        else if (status == 1){
            Logger.error("The destination file already exists - Project: " + projectId + ", Src: " + src + ", Dst: " + dst);
            return Response.status(409)
                    .entity(new ErrorInfo("The destination file already exists"))
                    .build();
        }
        else {
            Logger.error("Unauthorized access or path traversal attempt in move - User: " + jwt.getSubject() + ", Project: " + projectId + ", Src: " + src + ", Dst: " + dst);
            return Response.status(403)
                    .entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected"))
                    .build();
        }
    }

    @GET
    @RolesAllowed({"admin", "user"})
    @Path("/stock")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStock(@PathParam("projectId") String projectId) {
        String res = folderService.combineJsonFiles(projectId);
        return Response.ok(res).build();
    }

    @GET
    @RolesAllowed({"admin", "user"})
    @Path("/csv")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getCSV(@PathParam("projectId") String projectId) {


        byte[] fileContent = null;
        try {
            fileContent = folderService.jsonToCsv(projectId);
        } catch (IOException e) {
            return Response.status(404).entity("Could not build CSV for this project").build();
        }


        return Response.ok(fileContent)
                .type(MediaType.APPLICATION_OCTET_STREAM)
                .build();
    }
}