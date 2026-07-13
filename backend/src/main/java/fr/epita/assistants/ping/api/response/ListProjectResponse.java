package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class ListProjectResponse {
    List<ProjectResponse> projects;
}
