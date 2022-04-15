package com.skillchange.demo;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.corundumstudio.socketio.Configuration;

@SpringBootApplication
public class Application {

	@Value("${hostname}")
	private String host;

	@Value("${server.port}")
	private Integer port;

	@Bean
	public SocketIOServer socketIOServer() {
		Configuration config = new Configuration();
		config.setHostname(host);
		config.setPort(8081);
		return new SocketIOServer(config);
	}

	public static void main(String[] args) {
		SpringApplication.run(Application.class, args);
	}
}
