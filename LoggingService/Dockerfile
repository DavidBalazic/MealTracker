# docker build -t logging-service .
# docker run -p 8080:8080 --name loggingService logging-service-http
# echo '{"message": "Hello Fluent Bit"}' | nc localhost 24224

# Use Fluent Bit Alpine image
FROM fluent/fluent-bit:2.1.4

# Copy Fluent Bit configuration file
COPY fluent-bit.conf /fluent-bit/etc/

# Expose the HTTP port
EXPOSE 8080

# Set Fluent Bit's entrypoint
ENTRYPOINT ["/fluent-bit/bin/fluent-bit", "-c", "/fluent-bit/etc/fluent-bit.conf"]
