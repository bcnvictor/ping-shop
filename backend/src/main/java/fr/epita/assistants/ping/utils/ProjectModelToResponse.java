package fr.epita.assistants.ping.utils;

import fr.epita.assistants.ping.api.response.MemberResponse;
import fr.epita.assistants.ping.api.response.ProjectResponse;
import fr.epita.assistants.ping.api.response.UserResponse;
import fr.epita.assistants.ping.data.model.ProjectModel;
import fr.epita.assistants.ping.data.model.UserModel;

import java.util.ArrayList;
import java.util.List;

public class ProjectModelToResponse {

    public static ProjectResponse toResponse(ProjectModel projectModel)
    {
        List<MemberResponse> memberResponses = new ArrayList<>();
        for (UserModel userModel : projectModel.getMembers())
        {
            memberResponses.add(new MemberResponse()
                    .withDisplayName(userModel.getDisplayName())
                    .withId(userModel.getId())
                    .withAvatar(userModel.getAvatar()));
        }
        MemberResponse owner = new MemberResponse()
                .withDisplayName(projectModel.getOwner().getDisplayName())
                .withId(projectModel.getOwner().getId())
                .withAvatar(projectModel.getOwner().getAvatar());
        return new ProjectResponse()
                .withId(projectModel.getId())
                .withName(projectModel.getName())
                .withMembers(memberResponses)
                .withOwner(owner);
    }
}
