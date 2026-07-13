package fr.epita.assistants.ping.api.request;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
@Getter
@Setter
public class AddProductRequest {

    String name;
    Float price;
    Integer quantity;
    Integer category;
    String icon;
    String metro;
    String brand;
}
