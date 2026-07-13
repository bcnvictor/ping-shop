package fr.epita.assistants.ping.api.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@With
public class OrderResponse {
    Long orderId;
    String issuer;
    String seller;
    String content;
    String time;
    Integer status;
}
