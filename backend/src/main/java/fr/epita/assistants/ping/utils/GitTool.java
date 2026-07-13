package fr.epita.assistants.ping.utils;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

public class GitTool {

    static Map<String, Git> projects = new HashMap<>();

    static public boolean init(String project){
        try {
            File repoDir = new File(project);
            Git git = Git.init()
                    .setDirectory(repoDir)
                    .call();
            projects.put(project, git);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    static public boolean addFile(String project, String file, String id, String subject, String join){
        try {
            System.out.println(projects);
            projects.get(project).add().addFilepattern(file).call();
            Logger.gitCommand(subject, id, "add", join);
            return true;
        } catch (Exception e) {
            Logger.error("Git add failed for file: " + project);
            return false;
        }
    }

    static public boolean commit(String project, String msg, String id, String subject){
        try {
            projects.get(project).commit().setMessage(msg).call();
            Logger.gitCommand(subject, id, "commit", msg);
            return true;
        } catch (Exception e) {
            Logger.error("Git commit failed for project: " + project);
            return false;
        }
    }

}
