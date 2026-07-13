package fr.epita.assistants.ping.domain.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import fr.epita.assistants.ping.api.request.AddProductRequest;
import fr.epita.assistants.ping.api.request.ItemRequest;
import fr.epita.assistants.ping.data.repository.ProjectRepository;
import fr.epita.assistants.ping.data.repository.UserRepository;
import fr.epita.assistants.ping.utils.Category;
import fr.epita.assistants.ping.utils.ErrorInfo;
import fr.epita.assistants.ping.utils.Logger;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@ApplicationScoped
public class FileSystemService {

    @ConfigProperty(name="PROJECT_DEFAULT_PATH", defaultValue="/var/www/projects")
    String projectDefPath;

    @Inject
    ProjectRepository projectRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    ObjectMapper objectMapper;


    public byte[] getFileContent(String projectId, String relativePath) throws IOException {
        String filepath = Paths.get(projectDefPath, projectId, relativePath).toString();

        Path path = Paths.get(filepath);
        return Files.readAllBytes(path);
    }

    public String getFileContent(String projectId, int category, String name) throws IOException {
        String filepath = Paths.get(projectDefPath, projectId, Category.getCategoryName(category), name + ".json").toString();

        Path path = Paths.get(filepath);
        return Files.readString(path);
    }

    public void deleteFile(String projectId, String relativePath) throws IOException {
        Path filepath = Paths.get(projectDefPath, projectId, relativePath);
        Files.delete(filepath);
    }

    public void createFile(String projectId, String relativePath) throws IOException {
        Path filepath = Paths.get(projectDefPath, projectId, relativePath);
        if (!directoryExists(Paths.get(projectDefPath, projectId).toString()))
            throw new FileNotFoundException();
        Files.createFile(filepath);
    }

    public void moveFile(String projectId, String srcPath, String destPath) throws IOException {
        Path source = Paths.get(projectDefPath, projectId, srcPath);
        Path destination = Paths.get(projectDefPath, projectId, destPath);

        Files.move(source, destination);
    }

    public void uploadFile(String projectId, String relativePath, InputStream inputStream) throws IOException {
        Path source = Paths.get(projectDefPath, projectId, relativePath);

        Files.copy(inputStream, source, StandardCopyOption.REPLACE_EXISTING);
    }

    public Response checkValidity(String projectId, String relativePath, UUID userId, String func) {
        if (relativePath == null || relativePath.trim().isEmpty()) {
            Logger.error(func + ": The relative path is invalid (null or empty for example)");
            return Response.status(400).entity(new ErrorInfo("The relative path is invalid (null or empty for example)")).build();
        }

        UUID pid = UUID.fromString(projectId);


        if (!projectRepository.isIn(pid, userId) && !userRepository.isAdmin(userId)) {
            Logger.error(func + ": The user is not allowed to access the project or a path traversal attack was detected");
            return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected")).build();
        }

        try {
            Path basePath = Paths.get(projectDefPath, projectId).toRealPath();
            Path userPath = basePath.resolve(relativePath).normalize();

            if (!(userPath.startsWith(basePath))) {
                return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected")).build();
            }
        } catch (IOException e) {
            return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected")).build();
        }

        return null;
    }

    public boolean directoryExists(String directoryPath) {
        Path path = Paths.get(directoryPath);
        return Files.exists(path) && Files.isDirectory(path);
    }

    public Response createProduct(String projectId, AddProductRequest request, UUID userId) throws IOException {

        UUID pid = UUID.fromString(projectId);
        if (!projectRepository.isIn(pid, userId) && !userRepository.isAdmin(userId)) {
            return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected")).build();
        }
        String category = Category.getCategoryName(request.getCategory());
        Path categoryDir = Paths.get(projectDefPath, projectId, category);
        Path productFile = categoryDir.resolve(request.getName() + ".json");

        if (Files.exists(productFile)) {
            return Response.status(404).entity(new ErrorInfo("A product with that name already exists")).build();
        }

        ObjectNode productJson = createProductJson(request, projectId);
        Logger.createdItem(request.getName());
        String jsonString = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(productJson);
        Files.writeString(productFile, jsonString, StandardCharsets.UTF_8);

        return null;
    }

    public Response updateProduct(String projectId, AddProductRequest request, UUID userId) throws IOException {

        UUID pid = UUID.fromString(projectId);
        if (!projectRepository.isIn(pid, userId) && !userRepository.isAdmin(userId)) {
            return Response.status(403).entity(new ErrorInfo("The user is not allowed to access the project or a path traversal attack was detected")).build();
        }
        String category = Category.getCategoryName(request.getCategory());
        Path categoryDir = Paths.get(projectDefPath, projectId, category);
        Path productFile = categoryDir.resolve(request.getName() + ".json");

        if (!Files.exists(productFile)) {
            return Response.status(404).entity(new ErrorInfo("A product with that name doesn't exists")).build();
        }
        String json = Files.readString(productFile);
        ObjectMapper mapper = new ObjectMapper();

        JsonNode node = mapper.readTree(json);
        String lastOrder = node.get("last_sell").asText();
        int lastOrderCount = node.get("last_sell_quantity").asInt();

        ObjectNode productJson = updateProductJson(request, projectId, lastOrder, lastOrderCount);

        String jsonString = objectMapper.writerWithDefaultPrettyPrinter()
                .writeValueAsString(productJson);
        Files.writeString(productFile, jsonString, StandardCharsets.UTF_8);

        return null;
    }


    public Response updateStocks(InputStream inputStream, String projectId) {
        try {
            List<ProductData> csvData = readCsvFile(inputStream);

            for (ProductData product : csvData) {
                updateJsonFile(product, projectId);
            }

            return null;

        } catch (IOException e) {
            System.out.println(e.getMessage());
            return Response.status(404).entity(new ErrorInfo("The product could not be created")).build();
        }
    }


    private List<ProductData> readCsvFile(InputStream inputStream) throws IOException {
        List<ProductData> products = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line = reader.readLine();

            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                if (parts.length >= 3) {
                    String name = parts[0].trim();
                    int category = parts[1].trim().isEmpty() ? 0 : Integer.parseInt(parts[1].trim());
                    int quantityToAdd = Integer.parseInt(parts[2].trim());

                    products.add(new ProductData(name, category, quantityToAdd));
                }
            }
        }

        return products;
    }

    private void updateJsonFile(ProductData product, String projectId) throws IOException {

            String categoryName = Category.getCategoryName(product.category);
            Path categoryDir = Paths.get(projectDefPath, projectId, categoryName);

            Path jsonFilePath = categoryDir.resolve(product.name() + ".json");

            ObjectNode productJson;

            if (Files.exists(jsonFilePath)) {
                productJson = (ObjectNode) objectMapper.readTree(jsonFilePath.toFile());

                int currentStock = productJson.get("stock").asInt();
                int newStock = currentStock + product.quantityToAdd();
                productJson.put("stock", newStock);
                productJson.put("last_sell", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

                Logger.restockItem(product.name, product.quantityToAdd, newStock);

            } else {
                Logger.createdItem(product.name);
                Logger.restockItem(product.name, product.quantityToAdd, product.quantityToAdd);
                productJson = createProductCSV(product, projectId);
            }

            objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValue(jsonFilePath.toFile(), productJson);

    }

    private ObjectNode createProductCSV(ProductData product, String projectId) throws IOException {
        ObjectNode productJson = objectMapper.createObjectNode();

        productJson.put("id", generateUniqueId(projectId));
        productJson.put("name", product.name());
        productJson.put("price", 10);
        productJson.put("stock", product.quantityToAdd());
        productJson.put("category", product.category());
        productJson.put("icon", "default");
        productJson.put("last_sell", LocalDateTime.now().toString());
        productJson.put("last_sell_quantity", 0);
        productJson.put("metro_name", "default");
        productJson.put("brand", "default");

        return productJson;
    }

    private ObjectNode createProductJson(AddProductRequest request, String projectId) throws IOException {
        ObjectNode productJson = objectMapper.createObjectNode();


        productJson.put("id", generateUniqueId(projectId));
        productJson.put("name", request.getName());
        productJson.put("price", request.getPrice());
        productJson.put("stock", request.getQuantity());
        productJson.put("category", request.getCategory());
        productJson.put("icon", request.getIcon());
        productJson.put("last_sell", LocalDateTime.now().toString());
        productJson.put("last_sell_quantity", 0);
        productJson.put("metro_name", request.getMetro());
        productJson.put("brand", request.getBrand());

        return productJson;
    }

    private ObjectNode updateProductJson(AddProductRequest request, String projectId, String time, int count) throws IOException {
        ObjectNode productJson = objectMapper.createObjectNode();


        productJson.put("id", generateUniqueId(projectId));
        productJson.put("name", request.getName());
        productJson.put("price", request.getPrice());
        productJson.put("stock", request.getQuantity());
        productJson.put("category", request.getCategory());
        productJson.put("icon", request.getIcon());
        productJson.put("last_sell", time);
        productJson.put("last_sell_quantity", count);
        productJson.put("metro_name", request.getMetro());
        productJson.put("brand", request.getBrand());

        return productJson;
    }

    private int generateUniqueId(String projectId) throws IOException {
        Path projectDir = Paths.get(projectDefPath, projectId);

        if (!Files.exists(projectDir)) {
            return 1;
        }

        int maxId = 0;

        try (Stream<Path> paths = Files.walk(projectDir)) {
            maxId = paths.filter(Files::isRegularFile)
                    .filter(path -> path.toString().endsWith(".json"))
                    .mapToInt(this::getIdFromFile)
                    .max()
                    .orElse(0);
        }

        return maxId + 1;
    }

    private int getIdFromFile(Path filePath) {
        try {
            String content = Files.readString(filePath);
            JsonNode node = objectMapper.readTree(content);
            return node.get("id").asInt();
        } catch (Exception e) {
            return 0;
        }
    }

    public record ProductData(String name, int category, int quantityToAdd) {}
}
