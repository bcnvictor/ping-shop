package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class ListOrderResponse {
    List<OrderResponse> orders;
}
