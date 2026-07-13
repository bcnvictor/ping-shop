package fr.epita.assistants.ping.presentation.rest;

import com.fasterxml.jackson.core.JsonProcessingException;
import fr.epita.assistants.ping.api.request.OrderItemRequest;
import fr.epita.assistants.ping.api.request.OrderRequest;
import fr.epita.assistants.ping.api.response.OrderResponse;
import fr.epita.assistants.ping.data.model.OrderModel;
import fr.epita.assistants.ping.domain.service.OrderService;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Path("/api/order")
@Produces(MediaType.APPLICATION_JSON)
public class OrderResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    OrderService orderService;

    @POST
    @Authenticated
    @Path("/{projectId}/send")
    public Response sendOrder(@PathParam("projectId") String projectId, OrderRequest orderRequest) {
        for (OrderItemRequest item : orderRequest.getItems()) {
            try {
                if (!orderService.checkQuantity(item, projectId)) {
                    return Response.status(404).entity(new ErrorInfo("The order could not be created")).build();
                }
            }
            catch (Exception e) {
                return Response.status(404).entity(new ErrorInfo("The order could not be created")).build();
            }
        }
        UUID userId = UUID.fromString(jwt.getSubject());
        try {
            orderService.createOrder(orderRequest, userId);
        } catch (IOException e) {
            return Response.status(404).entity(new ErrorInfo("The order could not be created")).build();
        }
        return Response.status(204).build();
    }

    @POST
    @Authenticated
    @Path("/{projectId}/{id}/confirm")
    public Response confirmOrder(@PathParam("id") String orderId, @PathParam("projectId") String projectId) {
        int order = Integer.parseInt(orderId);

        List<OrderItemRequest> items = orderService.transformOrder(order);

        for (OrderItemRequest item : items) {
            try {
                if (!orderService.checkQuantity(item, projectId)) {
                    return Response.status(404).entity(new ErrorInfo("The order could not be created")).build();
                }
            }
            catch (Exception e) {
                return Response.status(404).entity(new ErrorInfo("The order could not be created")).build();
            }
        }
        
        Response response = orderService.updateStocks(projectId, order);
        if (response != null) {
            return response;
        }

        if (!orderService.confirmOrder(Integer.parseInt(orderId))){
            return Response.status(404).entity(new ErrorInfo("The order could not be validated")).build();
        }
        return Response.status(204).build();
    }

    @POST
    @Authenticated
    @Path("/{orderId}/{sellerId}/delivered")
    public Response deliverOrder(@PathParam("orderId") String orderId, @PathParam("sellerId") String sellerId) {

        UUID userId = UUID.fromString(sellerId);
        try {
            orderService.deliver(Integer.parseInt(orderId), userId);
        } catch (JsonProcessingException e) {
            System.out.println(e.getMessage());
            return Response.status(404).entity(new ErrorInfo("The order could not be validated")).build();
        }
        return Response.status(204).build();
    }

    @GET
    @Path("/orders")
    public Response getOrders() {
        List<OrderResponse> orders = orderService.getOrders();
        return Response.ok(orders).build();
    }

    @GET
    @Path("/pending")
    public Response getPendingOrders() {
        List<OrderResponse> orders = orderService.getPendingOrders();
        return Response.ok(orders).build();
    }

}
