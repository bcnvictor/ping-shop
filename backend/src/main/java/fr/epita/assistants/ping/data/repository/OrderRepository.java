package fr.epita.assistants.ping.data.repository;

import fr.epita.assistants.ping.data.model.OrderModel;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class OrderRepository implements PanacheRepository<OrderModel> {

    public OrderModel findByOrderId(int orderId) {
        return find("orderId", orderId).firstResult();
    }

    @Transactional
    public boolean confirmOrder(int orderId) {
        return update("status = 1 where orderId = ?1", orderId) > 0;
    }

    @Transactional
    public void deleteOrderById(int orderId) {
        delete("orderId", orderId);
    }

    @Transactional
    public OrderModel updateStatusAndSeller(Integer orderId, Integer status, UUID seller) {
        update("status = ?1, seller = ?2 where orderId = ?3", status, seller, orderId);
        return find("orderId", orderId).firstResult();
    }

    @Transactional
    public List<OrderModel> findAllOrders() {
        return list("SELECT o.orderId, o.issuer, o.seller, o.content, o.createdAt, o.status FROM OrderModel o");
    }

    @Transactional
    public List<OrderModel> findAllPending() {
        List<OrderModel> res = list("status = 0");
        res.addAll(list("status = 1"));
        return res;
    }
}