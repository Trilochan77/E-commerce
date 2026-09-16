package com.ecom.reward;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ReturnRewardServiceApplication {
  public static void main(String[] args) {
    SpringApplication.run(ReturnRewardServiceApplication.class, args);
  }
}
