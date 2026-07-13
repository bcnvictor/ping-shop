package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class LogResponse {
        public List<String> logs;
}
