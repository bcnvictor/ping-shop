package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class ProjectResponse {
    UUID id;
    String name;
    List<MemberResponse> members;
    MemberResponse owner;
}
