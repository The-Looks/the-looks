package vn.thelooks;

import org.springframework.boot.SpringApplication;

public class TestTheLooksApplication {

	public static void main(String[] args) {
		SpringApplication.from(TheLooksApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
