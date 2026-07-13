package fr.epita.assistants.ping.api.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class FileResponse {
    String name;
    String path;
    Boolean isDirectory;
}
