package com.ecom.order.exception;

import com.ecom.common.dto.ErrorResponse;
import java.time.Instant;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handle(ResponseStatusException ex, HttpServletRequest req) {
    int status = ex.getStatusCode().value();
    return ResponseEntity.status(status).body(new ErrorResponse(Instant.now(), status,
        ex.getStatusCode().toString(), ex.getReason(), req.getRequestURI()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex,
      HttpServletRequest req) {
    return ResponseEntity.status(422).body(new ErrorResponse(Instant.now(), 422,
        "UNPROCESSABLE_ENTITY", "Validation failed", req.getRequestURI()));
  }
}
