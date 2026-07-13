package fr.epita.assistants.ping.data.repository;

import static fr.epita.assistants.ping.utils.Format.generateDisplayNameFromLogin;
import static fr.epita.assistants.ping.utils.Format.isValidLogin;

import fr.epita.assistants.ping.data.model.UserModel;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.UUID;

@ApplicationScoped
public class UserRepository implements PanacheRepository<UserModel>
{
    public UserModel findUser(UUID id)
    {
        return find("id",id).firstResult();
    }

    public UserModel findByLogin(String login)
    {
        return find("login", login).firstResult();
    }

    @Transactional
    public UserModel createUser(String avatar, String displayName,
                                String login, String password, Boolean isAdmin) {
        if (!isValidLogin(login)) {
            throw new IllegalArgumentException("Invalid login format. Must be 'part1.part2' or 'part1_part2'");
        }

        if (findByLogin(login) != null) {
            throw new IllegalArgumentException("Login already exists: " + login);
        }
        UserModel newUser = new UserModel()
                .withAvatar(avatar)
                .withDisplayName(displayName)
                .withLogin(login)
                .withPassword(password)
                .withIsAdmin(isAdmin);
        if (displayName != null && !displayName.isEmpty()) {
            newUser.setDisplayName(displayName);
        } else {
            newUser.setDisplayName(generateDisplayNameFromLogin(login));
        }
        persist(newUser);
        return newUser;
    }

    public boolean alreadyExists(String login) {
        return count("login", login) > 0;
    }

    @Transactional
    public UserModel legacyUpdateUser(UUID id,String avatar, String displayName,
                                String login, String password, Boolean isAdmin)
    {
        UserModel updatedUser = find("id",id).firstResult();
        if(updatedUser != null)
        {
            updatedUser.setAvatar(avatar);
            updatedUser.setDisplayName(displayName);
            updatedUser.setLogin(login);
            updatedUser.setPassword(password);
            updatedUser.setIsAdmin(isAdmin);
            persist(updatedUser);
        }
        return updatedUser;
    }

    @Transactional
    public UserModel updateUser(UUID id,String avatar, String displayName, String password)
    {
        UserModel updatedUser = find("id",id).firstResult();
        if(updatedUser != null)
        {
            if (avatar != null)
            {
                updatedUser.setAvatar(avatar);
            }
            if (displayName != null)
            {
                updatedUser.setDisplayName(displayName);

            }
            if (password != null)
            {
                updatedUser.setPassword(password);
            }
            persist(updatedUser);
            return updatedUser;
        }
        return null;
    }



    @Transactional
    public boolean deleteUser(UUID id)
    {
        if (findUser(id) != null)
        {
            delete(findUser(id));
            return true;
        }
        return false;
    }
    public boolean deleteByLogin(String login)
    {
        if (findByLogin(login) != null)
        {
            delete(findByLogin(login));
            return true;
        }
        return false;
    }

    public boolean isAdmin(UUID userId)
    {
        return findUser(userId) != null ? findUser(userId).getIsAdmin() : false;
    }
}