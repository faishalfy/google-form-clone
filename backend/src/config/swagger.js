/**
 * Swagger Configuration
 * 
 * OpenAPI 3.0 specification for the Google Form Clone API.
 * Provides interactive API documentation at /api-docs
 * 
 * LEVEL 3 FEATURE:
 * - Complete API documentation
 * - Interactive testing interface
 * - Request/response examples
 * 
 * SCALABILITY NOTE (10,000+ users):
 * - Documentation is cached and served statically
 * - No performance impact on API endpoints
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Google Form Clone API',
            version: '3.0.0',
            description: `
## Overview

A production-ready RESTful API for a Google Forms clone application.

## Features

- **Authentication**: JWT-based authentication with secure token management
- **Forms Management**: Full CRUD operations for forms with status management
- **Questions Management**: Dynamic question types with validation
- **Submissions**: Submit and view form responses with detailed analytics
- **Authorization**: Role-based access control (form owner vs respondent)

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Rate Limiting

- 100 requests per 15 minutes per IP
- Returns 429 Too Many Requests when exceeded

## Error Responses

All errors follow a consistent format:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
\`\`\`
            `,
            contact: {
                name: 'API Support',
                email: 'support@example.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server'
            },
            {
                url: 'https://api.example.com/api',
                description: 'Production server'
            }
        ],
        tags: [
            {
                name: 'Authentication',
                description: 'User registration and login endpoints'
            },
            {
                name: 'Forms',
                description: 'Form CRUD operations and status management'
            },
            {
                name: 'Questions',
                description: 'Question management within forms'
            },
            {
                name: 'Submissions',
                description: 'Form submission and response management'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                // User schemas
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '550e8400-e29b-41d4-a716-446655440000'
                        },
                        name: {
                            type: 'string',
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                RegisterRequest: {
                    type: 'object',
                    required: ['name', 'email', 'password'],
                    properties: {
                        name: {
                            type: 'string',
                            minLength: 2,
                            maxLength: 100,
                            example: 'John Doe'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        password: {
                            type: 'string',
                            minLength: 8,
                            example: 'SecurePass123',
                            description: 'Must contain uppercase, lowercase, and number'
                        }
                    }
                },
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: {
                            type: 'string',
                            format: 'email',
                            example: 'john@example.com'
                        },
                        password: {
                            type: 'string',
                            example: 'SecurePass123'
                        }
                    }
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Login successful.'
                        },
                        data: {
                            type: 'object',
                            properties: {
                                token: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                                },
                                user: {
                                    $ref: '#/components/schemas/User'
                                }
                            }
                        }
                    }
                },

                // Form schemas
                Form: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        title: {
                            type: 'string',
                            example: 'Customer Feedback Survey'
                        },
                        description: {
                            type: 'string',
                            example: 'Help us improve our services'
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'published', 'closed'],
                            example: 'published'
                        },
                        is_published: {
                            type: 'boolean',
                            example: true
                        },
                        user_id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        question_count: {
                            type: 'integer',
                            example: 5
                        },
                        submission_count: {
                            type: 'integer',
                            example: 42
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updated_at: {
                            type: 'string',
                            format: 'date-time'
                        }
                    }
                },
                FormCreateRequest: {
                    type: 'object',
                    required: ['title'],
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 255,
                            example: 'Customer Feedback Survey'
                        },
                        description: {
                            type: 'string',
                            maxLength: 1000,
                            example: 'Help us improve our services'
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'published', 'closed'],
                            default: 'draft'
                        }
                    }
                },
                FormUpdateRequest: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 255
                        },
                        description: {
                            type: 'string',
                            maxLength: 1000
                        },
                        status: {
                            type: 'string',
                            enum: ['draft', 'published', 'closed']
                        }
                    }
                },

                // Question schemas
                Question: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        form_id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        title: {
                            type: 'string',
                            example: 'How satisfied are you with our service?'
                        },
                        type: {
                            type: 'string',
                            enum: ['short_answer', 'multiple_choice', 'checkbox', 'dropdown'],
                            example: 'multiple_choice'
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            example: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied']
                        },
                        is_required: {
                            type: 'boolean',
                            example: true
                        },
                        order_index: {
                            type: 'integer',
                            example: 0
                        }
                    }
                },
                QuestionCreateRequest: {
                    type: 'object',
                    required: ['title', 'type'],
                    properties: {
                        title: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 500,
                            example: 'How satisfied are you?'
                        },
                        type: {
                            type: 'string',
                            enum: ['short_answer', 'multiple_choice', 'checkbox', 'dropdown']
                        },
                        options: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Required for multiple_choice, checkbox, dropdown'
                        },
                        is_required: {
                            type: 'boolean',
                            default: false
                        },
                        order_index: {
                            type: 'integer',
                            default: 0
                        }
                    }
                },

                // Submission schemas
                Submission: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        form_id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        submitted_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        respondent: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                id: {
                                    type: 'string',
                                    format: 'uuid'
                                },
                                name: {
                                    type: 'string'
                                },
                                email: {
                                    type: 'string',
                                    format: 'email'
                                }
                            }
                        }
                    }
                },
                SubmissionDetail: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        form_id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        form_title: {
                            type: 'string'
                        },
                        submitted_at: {
                            type: 'string',
                            format: 'date-time'
                        },
                        respondent: {
                            type: 'object',
                            nullable: true
                        },
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    question_id: {
                                        type: 'string',
                                        format: 'uuid'
                                    },
                                    question_title: {
                                        type: 'string'
                                    },
                                    question_type: {
                                        type: 'string'
                                    },
                                    value: {
                                        oneOf: [
                                            { type: 'string' },
                                            { type: 'array', items: { type: 'string' } }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                SubmitRequest: {
                    type: 'object',
                    required: ['answers'],
                    properties: {
                        answers: {
                            type: 'array',
                            items: {
                                type: 'object',
                                required: ['question_id', 'value'],
                                properties: {
                                    question_id: {
                                        type: 'string',
                                        format: 'uuid'
                                    },
                                    value: {
                                        oneOf: [
                                            { type: 'string' },
                                            { type: 'array', items: { type: 'string' } }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },

                // Response schemas
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string'
                        },
                        error: {
                            type: 'object',
                            properties: {
                                code: {
                                    type: 'string'
                                },
                                details: {
                                    type: 'array',
                                    items: {
                                        type: 'object'
                                    }
                                }
                            }
                        }
                    }
                },
                Pagination: {
                    type: 'object',
                    properties: {
                        currentPage: {
                            type: 'integer',
                            example: 1
                        },
                        totalPages: {
                            type: 'integer',
                            example: 5
                        },
                        totalItems: {
                            type: 'integer',
                            example: 42
                        },
                        itemsPerPage: {
                            type: 'integer',
                            example: 10
                        },
                        hasNextPage: {
                            type: 'boolean',
                            example: true
                        },
                        hasPrevPage: {
                            type: 'boolean',
                            example: false
                        }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication required - no token or invalid token',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                success: false,
                                message: 'Access token is missing or invalid.',
                                error: {
                                    code: 'UNAUTHORIZED'
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Access denied - user does not have permission',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                success: false,
                                message: 'You do not have permission to access this resource.',
                                error: {
                                    code: 'FORBIDDEN'
                                }
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                success: false,
                                message: 'Resource not found.',
                                error: {
                                    code: 'NOT_FOUND'
                                }
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ErrorResponse'
                            },
                            example: {
                                success: false,
                                message: 'Validation failed.',
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    details: [
                                        {
                                            field: 'email',
                                            message: 'Invalid email format'
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI middleware
 * 
 * @param {Express.Application} app - Express application
 */
const setupSwagger = (app) => {
    // Serve Swagger UI at /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Google Form Clone API - Documentation',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showExtensions: true
        }
    }));
    
    // Serve raw OpenAPI spec as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    
    console.log('📚 API Documentation available at /api-docs');
};

module.exports = { 
    swaggerSpec,
    setupSwagger 
};
