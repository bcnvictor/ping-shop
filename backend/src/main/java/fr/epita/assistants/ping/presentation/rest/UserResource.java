package fr.epita.assistants.ping.presentation.rest;

import fr.epita.assistants.ping.api.request.LoginRequest;
import fr.epita.assistants.ping.api.request.UpdateUserRequest;
import fr.epita.assistants.ping.api.response.LoginResponse;
import fr.epita.assistants.ping.domain.service.CrudUserService;
import fr.epita.assistants.ping.domain.service.JwtTokenService;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import fr.epita.assistants.ping.api.request.CreateUserRequest;
import fr.epita.assistants.ping.api.response.UserResponse;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import org.eclipse.microprofile.jwt.JsonWebToken;


import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Path("/api/user")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RequestScoped
public class UserResource {


    @Inject
    CrudUserService crudUserService;

    @Inject
    JwtTokenService jwtTokenService;

    @Inject
    JsonWebToken jwt;


    @POST
    @Path("/")
    @RolesAllowed("admin")
    @Transactional
    public Response createUser(CreateUserRequest request) {
        String userId = jwt.getSubject();
        Logger.userAction(userId, "CREATE_USER", "Attempting to create user with login: " + request.getLogin());
        return crudUserService.createUser(UUID.fromString(userId), request.getLogin(), request.getPassword(), request.getIsAdmin());

    }

    @GET
    @Path("/all")
    @Produces(MediaType.APPLICATION_JSON)
    @Authenticated
    public Response getAllUsers() {
        String userId = jwt.getSubject();
        Logger.userAction(userId, "GET ALL USERS", "User " + userId + " is fetching all users");
        List<UserResponse> users = crudUserService.getAllUsers();
        Logger.userAction(userId, "GET ALL USERS", "User " + userId + " fetched " + users.size() + " users");
        return Response.ok(users).build();
    }


    @GET
    @Path("/{id}")
    @RolesAllowed({"admin", "user"})
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUser(@PathParam("id") String id) {
        String userId = jwt.getSubject();
        Logger.userAction(userId, "GET USER", "User " + userId + " is fetching user " + id);
        if (!jwt.getGroups().contains("admin") && !Objects.equals(jwt.getSubject(), id)) {
            Logger.error("Unauthorized access attempt - User " + userId + " tried to access user " + id);
            return Response
                    .status(403)
                    .entity(new ErrorInfo("Non-admin users can't see anyone but themselves !"))
                    .build();
        }
        UUID userUuid;
        try {
            userUuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Logger.error("Invalid UUID format for user ID: " + id);
            return Response
                    .status(400)
                    .entity(new ErrorInfo("Invalid user ID format. Expected UUID format."))
                    .build();
        }
        return crudUserService.getUserById(userUuid);
    }


    @POST
    @Path("/login")
    public Response loginUser(LoginRequest loginRequest) {
        Logger.info("Attempting to login user with login: " + loginRequest.getLogin() + " and password: " + loginRequest.getPassword());
        if (loginRequest.getLogin() == null || loginRequest.getPassword() == null) {
            Logger.error("Login attempt with null credentials");
            return Response.status(400)
                    .entity(new ErrorInfo("Invalid (null) login/password"))
                    .build();
        }
        String token = jwtTokenService.logInUser(loginRequest.getLogin(),loginRequest.getPassword());
        if (token == null)
        {
            Logger.authAttempt(loginRequest.getLogin(),false);

            return Response.status(401)
                    .entity(new ErrorInfo("Invalid login/password combo")).build();
        }
        Logger.authAttempt(loginRequest.getLogin(),true);
        return Response.ok(new LoginResponse(token)).build();
    }

    @GET
    @Authenticated
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/refresh")
    public Response refreshUserToken() {
        String userId = jwt.getSubject();
        Logger.userAction(userId, "REFRESH_TOKEN", "User " + userId + " is refreshing their token");
        return jwtTokenService.refreshUserToken(userId);

    }

    @PUT
    @RolesAllowed({"admin", "user"})
    @Path("/{id}")
    @Transactional
    @Produces(MediaType.APPLICATION_JSON)
    public Response updateUser(@PathParam("id") String id, UpdateUserRequest request) {

        String userId = jwt.getSubject();
        StringBuilder logMessage = new StringBuilder("User " + userId + " is updating user " + id);
        if (request.getDisplayName() != null) {
            logMessage.append(" - New name: ").append(request.getDisplayName());
        }
        if (request.getAvatar() != null) {
            logMessage.append(" - New avatar: ").append(request.getAvatar());
        }
        if (request.getPassword() != null) {
            logMessage.append(" - Password changed:").append(request.getPassword());
        }

        Logger.userAction(userId, "UPDATE_USER", logMessage.toString());
        if (!jwt.getGroups().contains("admin") && !Objects.equals(jwt.getSubject(), id)) {
            Logger.error("Unauthorized update attempt - User " + userId + " tried to update user " + id);
            return Response
                    .status(403)
                    .entity(new ErrorInfo("Non-admin users can't see anyone but themselves !"))
                    .build();
        }
        UUID userUuid;
        try {
            userUuid = UUID.fromString(id);
        } catch (IllegalArgumentException e) {
            Logger.error("Invalid UUID format for user ID in update: " + id);
            return Response
                    .status(400)
                    .entity(new ErrorInfo("Invalid user ID format. Expected UUID format."))
                    .build();
        }
        return crudUserService.updateUser(userUuid,request.getDisplayName(),request.getAvatar(),request.getPassword());
    }

    @DELETE
    @RolesAllowed("admin")
    @Transactional
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") String id) {
        String adminId = jwt.getSubject();
        Logger.userAction(adminId, "DELETE_USER", "Admin " + adminId + " is attempting to delete user " + id);

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
        return crudUserService.tryDeleteUser(userUuid);
    }
}