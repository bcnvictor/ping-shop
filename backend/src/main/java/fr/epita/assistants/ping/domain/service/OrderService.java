package fr.epita.assistants.ping.domain.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.epita.assistants.ping.api.request.OrderItemRequest;
import fr.epita.assistants.ping.api.request.OrderRequest;
import fr.epita.assistants.ping.api.response.OrderResponse;
import fr.epita.assistants.ping.data.model.OrderModel;
import fr.epita.assistants.ping.data.model.UserModel;
import fr.epita.assistants.ping.data.repository.OrderRepository;
import fr.epita.assistants.ping.data.repository.UserRepository;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import static fr.epita.assistants.ping.utils.Category.getCategoryName;

@ApplicationScoped
public class OrderService {

    @Inject
    OrderRepository orderRepository;

    @ConfigProperty(name="PROJECT_DEFAULT_PATH", defaultValue="/var/www/projects")
    String projectDefPath;
    @Inject
    UserRepository userRepository;
    @Inject
    ObjectMapper objectMapper;

    public boolean checkQuantity(OrderItemRequest orderItemRequest, String projectId) throws IOException {
        String category = getCategoryName(orderItemRequest.getCategory());
        Path path = Paths.get(projectDefPath, projectId, category, orderItemRequest.getName() + ".json");
        if (!Files.exists(path)) {
            return false;
        }
        String json = Files.readString(path);
        ObjectMapper mapper = new ObjectMapper();

        JsonNode node = mapper.readTree(json);
        int total = node.get("stock").asInt();

        return total >= orderItemRequest.getQuantity();
    }

    @Transactional
    public void createOrder(OrderRequest orderRequest, UUID userId) throws IOException
    {
        ObjectMapper mapper = new ObjectMapper();
        String content = mapper.writeValueAsString(orderRequest);

        OrderModel order = new OrderModel();
        order.setIssuer(userId);
        order.setContent(content);
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus(0);

        orderRepository.persist(order);

    }

    @Transactional
    public boolean confirmOrder(int orderId) {
        return orderRepository.confirmOrder(orderId);
    }

    public List<OrderItemRequest> transformOrder(int orderId) {
        try {
            OrderModel order = orderRepository.findByOrderId(orderId);

            String contentJson = order.getContent();
            OrderRequest content = objectMapper.readValue(contentJson, OrderRequest.class);

            return content.getItems();

        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public Response updateStocks(String projectId, int orderId){
        try {
            OrderModel order = orderRepository.findByOrderId(orderId);

            if (order.getStatus() != 0) {
                return Response.status(404).entity(new ErrorInfo("This order has already been confirmed or delivered")).build();
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(order.getContent());

            JsonNode itemsNode = rootNode.get("items");
            if (itemsNode != null && itemsNode.isArray()) {
                for (JsonNode item : itemsNode) {
                    String category = getCategoryName(item.get("category").asInt());
                    Path path = Paths.get(projectDefPath, projectId, category, item.get("name").asText() + ".json");

                    String json = Files.readString(path);

                    JsonNode node = mapper.readTree(json);
                    int currentStock = node.get("stock").asInt();
                    int quantity = item.get("quantity").asInt();


                    int newStock = currentStock - quantity;

                    Logger.stockUpdate(node.get("name").asText(), quantity, newStock);

                    if (node instanceof ObjectNode objectNode) {
                        objectNode.put("stock", newStock);
                        objectNode.put("last_sell", String.valueOf(LocalDateTime.now()));
                        objectNode.put("last_sell_quantity", quantity);
                    }

                    String updatedJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
                    Files.writeString(path, updatedJson, StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);

                }
            }
        }
        catch (IOException e) {
            return Response.status(404).entity(new ErrorInfo("The order could not be delivered properly")).build();
        }

        return null;
    }

    @Transactional
    public void deliver(int orderId, UUID sellerId) throws JsonProcessingException {

        OrderModel model = orderRepository.updateStatusAndSeller(orderId, 2, sellerId);

        String buyerName = userRepository.findUser(model.getIssuer()).getDisplayName();
        String sellerName = userRepository.findUser(model.getSeller()).getDisplayName();

        ObjectMapper mapper = new ObjectMapper();
        OrderRequest wrapper = mapper.readValue(model.getContent(), OrderRequest.class);

        String logged = wrapper.getItems().stream()
                .map(item -> item.getName() + ": " + item.getQuantity() + "x")
                .collect(Collectors.joining(", "));

        Logger.shopPurchase(buyerName, sellerName, logged);
    }

    @Transactional
    public List<OrderResponse> getOrders() {
        List<OrderModel> orders = orderRepository.listAll();
        return orders.stream()
                .map(order ->
                {
                    UserModel issuerUser = userRepository.findUser(order.getIssuer());
                    UserModel seller = order.getSeller() == null ? null : userRepository.findUser(order.getSeller());
                    return new OrderResponse(order.getOrderId(), issuerUser.getLogin(), seller == null ? null : seller.getLogin(), order.getContent(), order.getCreatedAt().toString(), order.getStatus());
                })
                .toList();

    }

    @Transactional
    public List<OrderResponse> getPendingOrders() {
        List<OrderModel> orders = orderRepository.findAllPending();
        return orders.stream()
                .map(order ->
                {
                    UserModel issuerUser = userRepository.findUser(order.getIssuer());
                    return new OrderResponse(order.getOrderId(), issuerUser.getLogin(), null, order.getContent(), order.getCreatedAt().toString(), order.getStatus());
                })
                .toList();
    }
}
