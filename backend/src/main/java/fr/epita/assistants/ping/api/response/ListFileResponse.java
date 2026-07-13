package fr.epita.assistants.ping.api.response;

import lombok.*;
import org.opentest4j.FileInfo;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class ListFileResponse {
    List<FileResponse> files;
}
