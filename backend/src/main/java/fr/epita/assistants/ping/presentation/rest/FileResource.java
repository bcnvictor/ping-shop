package fr.epita.assistants.ping.presentation.rest;

import fr.epita.assistants.ping.api.request.*;
import fr.epita.assistants.ping.domain.service.FileSystemService;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.util.UUID;

@Path("/api/projects/{projectId}/files")
public class FileResource {

    @Inject
    JsonWebToken jwt;
    @Inject
    FileSystemService fileService;

    @GET
    @Path("/")
    @Authenticated
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getProjectFiles(@PathParam("projectId") String projectId, @QueryParam("path") String relativePath) {
        UUID userId = UUID.fromString(jwt.getSubject());
        Response response = fileService.checkValidity(projectId, relativePath, userId, "Get Project Files");
        if (response != null) {
            return response;
        }
        try {
            byte[] fileContent = fileService.getFileContent(projectId, relativePath);

            Logger.fileSystemAction(jwt.getSubject(), projectId, "Get Project File", relativePath);

            return Response.ok(fileContent)
                    .type(MediaType.APPLICATION_OCTET_STREAM)
                    .build();

        } catch (Exception e) {
            Logger.error("Get Project Files: The project or the relative path could not be found");
            return Response.status(404).entity(new ErrorInfo("The project or the relative path could not be found")).build();
        }

    }

    @DELETE
    @Path("/")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response deleteProjectFiles(@PathParam("projectId") String projectId, CreateFileRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String relativePath = request.getRelativePath();
        Response response = fileService.checkValidity(projectId, relativePath, userId,  "Delete Project Files");
        if (response != null)
            return response;

        try {
            fileService.deleteFile(projectId, relativePath);

            Logger.fileSystemAction(jwt.getSubject(), projectId, "Delete Project File", relativePath);
            return Response.status(204).build();

        }
        catch (Exception e) {
            Logger.error("Delete Project Files: The project or the file could not be found");
            return Response.status(404).entity(new ErrorInfo("The project or the file could not be found")).build();
        }
    }

    @POST
    @Path("/")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response createProjectFiles(@PathParam("projectId") String projectId, CreateFileRequest request) {

        UUID userId = UUID.fromString(jwt.getSubject());

        String relativePath = request.getRelativePath();
        Response response = fileService.checkValidity(projectId, relativePath, userId, "Create Project Files");
        if (response != null)
            return response;

        try {
            fileService.createFile(projectId, relativePath);

            Logger.fileSystemAction(jwt.getSubject(), projectId, "Create Project File", relativePath);
            return Response.status(201).build();

        } catch (FileAlreadyExistsException e) {
            Logger.error("Create Project Files: The file already exists");
            return Response.status(409).entity(new ErrorInfo("The file already exists")).build();
        } catch (Exception e) {
            Logger.error("Create Project Files: The project could not be found");
            return Response.status(404).entity(new ErrorInfo("The project could not be found")).build();
        }
    }

    @PUT
    @Path("/move")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response moveProjectFiles(@PathParam("projectId") String projectId, MoveRequest request) {
        UUID userId = UUID.fromString(jwt.getSubject());
        String src = request.getSrc();
        String dest = request.getDst();
        Response response = fileService.checkValidity(projectId, src, userId,  "Move Project Files");
        if (response != null)
            return response;
        Response response2 = fileService.checkValidity(projectId, dest, userId,  "Move Project Files");
        if (response2 != null)
            return response2;

        try {
            fileService.moveFile(projectId, src, dest);

            Logger.fileSystemAction(jwt.getSubject(), projectId, "Move Project File", src + " -> " + dest);
            return Response.status(204).build();

        } catch (FileAlreadyExistsException e) {
            Logger.error("Move Project Files: The file already exists");
            return Response.status(409).entity(new ErrorInfo("The file already exists")).build();
        } catch (Exception e) {
            Logger.error("Move Project Files: The project could not be found");
            return Response.status(404).entity(new ErrorInfo("The project could not be found")).build();
        }
    }

    @POST
    @Path("/upload")
    @Authenticated
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    @Produces(MediaType.APPLICATION_JSON)
    public Response uploadProjectFiles(@PathParam("projectId") String projectId,
                                       @QueryParam("path") String relativePath,
                                       InputStream inputStream) {
        UUID userId = UUID.fromString(jwt.getSubject());
        Response response = fileService.checkValidity(projectId, relativePath, userId,  "Upload Project Files");
        if (response != null) {
            return response;
        }

        try {
            fileService.uploadFile(projectId, relativePath, inputStream);

            Logger.fileSystemAction(jwt.getSubject(), projectId, "Upload Project File", relativePath);
            return Response.status(201).build();
        } catch (Exception e) {
            Logger.error("Upload Project Files: The project could not be found");
            return Response.status(404).entity(new ErrorInfo("The project could not be found")).build();
        }
    }

    @POST
    @Path("/new")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response addProductToShop(@PathParam("projectId") String projectId, AddProductRequest addProductRequest) {

        try {
            UUID userId = UUID.fromString(jwt.getSubject());
            Response response = fileService.createProduct(projectId, addProductRequest, userId);
            if (response != null) {
                return response;
            }
        } catch (IOException e) {
            return Response.status(404).entity(new ErrorInfo("The product could not be created")).build();
        }
        return Response.status(201).build();
    }

    @GET
    @Path("/item/{category}/{name}")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProductInfos(@PathParam("projectId") String projectId, @PathParam("category") String category, @PathParam("name") String name) {

        try {
            UUID userId = UUID.fromString(jwt.getSubject());
            return Response.ok(fileService.getFileContent(projectId, Integer.parseInt(category), name)).build();

        } catch (IOException e) {
            return Response.status(404).entity(new ErrorInfo("The product doesn't exist")).build();
        }
    }

    @PUT
    @Path("/update")
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProductShop(@PathParam("projectId") String projectId, AddProductRequest addProductRequest) {

        try {
            UUID userId = UUID.fromString(jwt.getSubject());
            Response response = fileService.updateProduct(projectId, addProductRequest, userId);
            if (response != null) {
                return response;
            }
        } catch (IOException e) {
            return Response.status(404).entity(new ErrorInfo("The product could not be updated")).build();
        }
        return Response.status(201).build();
    }

    @POST
    @Path("/restock")
    @Authenticated
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    @Produces(MediaType.APPLICATION_JSON)
    public Response restockShopCSV(@PathParam("projectId") String projectId, InputStream inputStream) {

        Response response = fileService.updateStocks(inputStream , projectId);
        if (response != null) {
            return response;
        }
        return Response.status(201).build();
    }
}