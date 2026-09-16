package com.ecom.common.dto;

import java.time.Instant;

/** Standard error body for all services (SRS: appropriate messages for errors/invalid requests). */
public record ErrorResponse(Instant timestamp, int status, String error, String message, String path) {}
