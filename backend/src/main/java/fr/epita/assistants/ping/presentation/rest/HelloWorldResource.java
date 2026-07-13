package fr.epita.assistants.ping.presentation.rest;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;


import static fr.epita.assistants.ping.errors.ErrorsCode.EXAMPLE_ERROR;
@Path("/api")
public class HelloWorldResource {


    //----------------- Files ------------------

    @GET
    @Path("/hello")
    @Produces(MediaType.TEXT_PLAIN)
    public Response helloWorld() {
        return Response.ok("Hello World !").build();
    }

    @GET
    @Path("/error")
    @Produces(MediaType.APPLICATION_JSON)
    public Response error() {
        EXAMPLE_ERROR.throwException("This is an error");
        // This line will never be reached
        return Response.noContent().build();
    }
    /*
    @GET
    @Path("/projects/{projectId}/files")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response getProjectFiles(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @DELETE
    @Path("/projects/{projectId}/files")
    @Produces(MediaType.TEXT_PLAIN)
    public Response deleteProjectFiles(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/{projectId}/files")
    @Produces(MediaType.TEXT_PLAIN)
    public Response createProjectFiles(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @PUT
    @Path("/projects/{projectId}/files/move")
    @Produces(MediaType.TEXT_PLAIN)
    public Response moveProjectFiles(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/{projectId}/files/upload")
    @Produces(MediaType.APPLICATION_OCTET_STREAM)
    public Response uploadProjectFiles(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    //----------------- Folders ------------------

    @GET
    @Path("/projects/{projectId}/folders")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProjectFolders(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @DELETE
    @Path("/projects/{projectId}/folders")
    @Produces(MediaType.TEXT_PLAIN)
    public Response deleteProjectFolders(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/{projectId}/folders")
    @Produces(MediaType.TEXT_PLAIN)
    public Response createProjectFolders(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    @PUT
    @Path("/projects/{projectId}/folders")
    @Produces(MediaType.TEXT_PLAIN)
    public Response moveProjectFolders(@PathParam("projectId") String projectId) {
        //TODO
        return Response.noContent().build();
    }

    //----------------- Projects ------------------

    @GET
    @Path("/projects")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProjects() {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createProjects() {
        //TODO
        return Response.noContent().build();
    }

    @GET
    @Path("/projects/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllProjects() {
        //TODO
        return Response.noContent().build();
    }

    @PUT
    @Path("/projects/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateProject(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @GET
    @Path("/projects/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getProject(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @DELETE
    @Path("/projects/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response deleteProject(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/{id}/add-user")
    @Produces(MediaType.TEXT_PLAIN)
    public Response addUser(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/{id}/remove-user")
    @Produces(MediaType.TEXT_PLAIN)
    public Response removeUser(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    //----------------- User ------------------

    @POST
    @Path("/user")
    @Produces(MediaType.APPLICATION_JSON)
    public Response createUser() {
        //TODO
        return Response.noContent().build();
    }

    @GET
    @Path("/user/all")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAllUsers() {
        //TODO
        return Response.noContent().build();
    }

    @POST
    @Path("/user/login")
    @Produces(MediaType.APPLICATION_JSON)
    public Response loginUser() {
        //TODO
        return Response.noContent().build();
    }

    @GET
    @Path("/user/refresh")
    @Produces(MediaType.APPLICATION_JSON)
    public Response refreshUserToken() {
        //TODO
        return Response.noContent().build();
    }

    @PUT
    @Path("/user/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUser(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @GET
    @Path("/user/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }

    @DELETE
    @Path("/user/{id}")
    @Produces(MediaType.TEXT_PLAIN)
    public Response deleteUser(@PathParam("id") String id) {
        //TODO
        return Response.noContent().build();
    }
    */
}