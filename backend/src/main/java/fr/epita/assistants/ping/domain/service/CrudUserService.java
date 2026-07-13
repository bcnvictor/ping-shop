package fr.epita.assistants.ping.domain.service;

import static fr.epita.assistants.ping.utils.Format.isValidLogin;

import fr.epita.assistants.ping.api.response.UserResponse;
import fr.epita.assistants.ping.data.model.ProjectModel;
import fr.epita.assistants.ping.data.model.UserModel;
import fr.epita.assistants.ping.data.repository.ProjectRepository;
import fr.epita.assistants.ping.data.repository.UserRepository;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;


import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class CrudUserService {

    @Inject
    UserRepository userRepository;
    @Inject
    ProjectRepository projectRepository;

    public Response createUser(UUID userId, String login, String password, Boolean isAdmin)
    {
        if (!isValidLogin(login))
        {
            Logger.error("Invalid login : " + login);
            return Response.status(400).entity(new ErrorInfo("Invalid login : " + login)).build();
        }

        if (userRepository.alreadyExists(login))
        {
            Logger.error("Login already exists (rip bozo, il s'est fait volé son login): " + login);
            return Response.status(409).entity(new ErrorInfo("Login already exists")).build();
        }

        UserModel user = userRepository.createUser("", null, login, password, isAdmin);
        //Logger.userAction(userId.toString(), "CREATE_USER", "User created successfully");

        UserResponse res = new UserResponse()
                .withId(user.getId())
                .withLogin(user.getLogin())
                .withDisplayName(user.getDisplayName())
                .withIsAdmin(user.getIsAdmin())
                .withAvatar(user.getAvatar());
        return Response.ok(200).entity(res).build();

    }

    public List<UserResponse> getAllUsers() {

        List<UserModel> users = userRepository.listAll();
        return users.stream()
                .map(user ->
                {
                    return new UserResponse(user.getId(), user.getLogin(), user.getDisplayName(), user.getIsAdmin(), user.getAvatar());
                })
                .toList();
    }

    public Response getUserById(UUID id) {

        UserModel user = userRepository.findUser(id);
        if (user == null)
        {
            return Response.status(404).entity(new ErrorInfo("User not found.")).build();
        }
        UserResponse result = new UserResponse()
                .withId(user.getId())
                .withLogin(user.getLogin())
                .withDisplayName(user.getDisplayName())
                .withIsAdmin(user.getIsAdmin())
                .withAvatar(user.getAvatar());
        return Response.ok(200).entity(result).build();

    }
    public Response updateUser(UUID uuid, String displayName,String avatar,String password)
    {
        UserModel user = userRepository.findUser(uuid);
        if (user == null){
            return Response.status(404).entity(new ErrorInfo("The user could not be found")).build();
        }
        String newDisplayName = null;
        String newAvatar = null;
        String newPassword = null;
        if (displayName != null && !displayName.trim().isEmpty())
        {
            newDisplayName = displayName;
        }
        if (avatar != null)
        {
            newAvatar = avatar;
        }
        if (password != null && !password.trim().isEmpty())
        {
            newPassword = password;
        }
        UserModel updatedUser = userRepository.updateUser(uuid,newAvatar,newDisplayName,newPassword);

        UserResponse result = new UserResponse()
                .withId(updatedUser.getId())
                .withLogin(updatedUser.getLogin())
                .withDisplayName(updatedUser.getDisplayName())
                .withIsAdmin(updatedUser.getIsAdmin())
                .withAvatar(updatedUser.getAvatar());
        return Response.ok(200).entity(result).build();
    }

    public  Response tryDeleteUser(UUID id)
    {
        UserModel user = userRepository.findUser(id);
        if (user == null){
            return Response.status(404).entity(new ErrorInfo("The user could not be found")).build();
        }
        List<ProjectModel> projects_owned = projectRepository.findProjectsByOwner(user);
        if (!projects_owned.isEmpty())
        {
            return Response
                    .status(403)
                    .entity(new ErrorInfo("The user is not allowed to access this endpoint, or the user owns projects"))
                    .build();

        }
        userRepository.deleteUser(id);
        return Response.status(204).build();
    }

}