# docker build -t logging-service .
# docker run -p 24224:24224 --name loggingService logging-service
# echo '{"message": "Hello Fluent Bit"}' | nc localhost 24224

# Use Fluent Bit Alpine image
FROM fluent/fluent-bit:2.1.4

# Copy Fluent Bit configuration file
COPY fluent-bit.conf /fluent-bit/etc/

# Set Fluent Bit's entrypoint
ENTRYPOINT ["/fluent-bit/bin/fluent-bit", "-c", "/fluent-bit/etc/fluent-bit.conf"]
