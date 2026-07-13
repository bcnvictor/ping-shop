package fr.epita.assistants.ping.data.repository;

import fr.epita.assistants.ping.data.model.ProjectModel;
import fr.epita.assistants.ping.data.model.UserModel;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class ProjectRepository implements PanacheRepository<ProjectModel> {

    @Transactional
    public ProjectModel createProject(String name, String path, UserModel owner) {
        if (path == null) {
            path = "/var/www/projects/";
        }
        if (!path.endsWith("/")) {
            path = path + "/";
        }
        ProjectModel newProject = new ProjectModel()
                .withName(name)
                .withPath(path)
                .withOwner(owner);
        persist(newProject);
        newProject.setPath(path + newProject.getId().toString());
        persist(newProject);
        return newProject;
    }

    public ProjectModel findProject(UUID id)
    {
        return find("id",id).firstResult();
    }

    @Transactional
    public ProjectModel updateProject(UUID id, String name, UserModel owner) {
        ProjectModel updatedProject = findProject(id);
        if (updatedProject != null)
        {
            if (name != null)
            {
                updatedProject.setName(name);

            }
            if (owner != null)
            {
                updatedProject.setOwner(owner);
            }
            persist(updatedProject);
        }
        return updatedProject;
    }

    @Transactional
    public boolean deleteProject(UUID id)
    {
        if (findProject(id) != null)
        {
            delete(findProject(id));
            return true;
        }
        return false;
    }

    @Transactional
    public ProjectModel addMember(UUID projectId, UserModel user) {
        ProjectModel project = findProject(projectId);
        if (project != null) {
            project.getMembers().add(user);
            persist(project);
        }
        return project;
    }

    @Transactional
    public ProjectModel removeMember(UUID projectId, UserModel user) {
        ProjectModel project = findProject(projectId);
        if (project != null) {
            project.getMembers().remove(user);
            persist(project);
        }
        return project;
    }

    public List<ProjectModel> findProjectsByOwner(UserModel owner) {
        return find("owner", owner).list();
    }

    public List<ProjectModel> findProjectsByMember(UserModel user) {
        return find("SELECT p FROM ProjectModel p JOIN p.members m WHERE m = ?1", user).list();
    }

    @Inject UserRepository userRepository;

    public boolean isIn(UUID projectUUID, String memberLogin)
    {
        ProjectModel project = findProject(projectUUID);
        UserModel member = userRepository.findUser(UUID.fromString(memberLogin));
        if (project != null && member != null)
        {
            System.out.println(project.members);
            return project.members.contains(member) || project.owner.getLogin().equals(memberLogin);
        }
        return false;
    }

    public boolean isIn(UUID projectUUID, UUID memberUUID)
    {
        ProjectModel project = findProject(projectUUID);
        UserModel member = userRepository.findUser(memberUUID);
        if (project != null && member != null)
        {
            return project.members.contains(member) ||  project.owner.getId().equals(memberUUID);
        }
        return false;
    }
}