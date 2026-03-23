# Siren Backend — CLAUDE.md

## Stack
- **NestJS** (v11+) with TypeScript
- **TypeORM** with PostgreSQL
- **Passport + JWT** for authentication
- **class-validator** / **class-transformer** for DTO validation
- **Joi** for environment variable validation at startup
- **Swagger** (`@nestjs/swagger`) for API documentation
- **bcrypt** via HashingAdapter for password hashing
- **nodemailer** via EmailService for transactional emails
- **Docker** for containerized PostgreSQL

## Folder Structure

```
src/
├── main.ts                                ← Bootstrap: prefix, pipes, filters, interceptors, swagger
├── app.module.ts                          ← Root module: ConfigModule (Joi), TypeORM, all feature modules
├── config/
│   ├── env.config.ts                      ← EnvConfiguration() + envValidationSchema (Joi)
│   └── index.ts                           ← Barrel export
├── common/
│   ├── common.module.ts                   ← Exports: DatabaseExceptionHandler, adapters
│   ├── adapters/
│   │   ├── hashing-adapter/
│   │   │   └── hashing-adapter.ts         ← Implements HashingAdapterInterface
│   │   ├── uuid-adapter/
│   │   │   └── uuid-adapter.ts            ← Wraps uuid v4
│   │   └── index.ts                       ← Barrel
│   ├── decorators/
│   │   └── match.decorator.ts             ← @Match('field') for password confirmation
│   ├── dto/
│   │   └── pagination.dto.ts              ← PaginationDto (limit, offset) — shared across modules
│   ├── filters/
│   │   └── global-exception.filter.ts     ← Catches HttpException, QueryFailedError, Error
│   ├── interceptors/
│   │   └── response.interceptor.ts        ← Wraps responses in { statusCode, message, data }
│   ├── interfaces/
│   │   ├── hashing.adapter.interface.ts
│   │   └── index.ts
│   ├── providers/
│   │   └── database-exception-handler.provider.ts  ← Translates DB errors to user-friendly exceptions
│   └── utils/
│       ├── http-response-messages.ts      ← HttpResponseMessage.success/created/updated/deleted/custom
│       ├── generate-token-crypto.ts       ← generateAlphaNumericToken() — 6 char hex
│       └── index.ts
└── modules/
    ├── auth/                              ← Authentication & authorization
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── decorators/
    │   │   ├── auth.decorator.ts          ← @Auth(ValidRoles.USER) — composition decorator
    │   │   ├── get-user.decorator.ts      ← @GetUser() — extracts AuthUser from request
    │   │   ├── raw-header.decorator.ts
    │   │   ├── role-protected/
    │   │   │   └── role-protected.decorator.ts  ← @RoleProtected() — sets META_ROLES metadata
    │   │   └── index.ts
    │   ├── dto/
    │   │   ├── register-user.dto.ts
    │   │   ├── login-user.dto.ts
    │   │   ├── email.dto.ts               ← EmailDto with @Transform lowercase trim
    │   │   ├── token.dto.ts
    │   │   ├── updatePassword.dto.ts      ← Uses @Match('password') for confirmation
    │   │   └── index.ts
    │   ├── entities/
    │   │   └── token.entity.ts            ← Token with @BeforeInsert expiry, isExpired() method
    │   ├── enums/
    │   │   ├── valid-roles.enum.ts        ← ValidRoles { ADMIN, SUPER_USER, USER }
    │   │   ├── token-type.enum.ts         ← TokenType { EMAIL_VERIFICATION, PASSWORD_RESET }
    │   │   └── index.ts
    │   ├── guards/
    │   │   └── user-roles/
    │   │       └── user-roles.guard.ts    ← Checks user.roles against META_ROLES metadata
    │   ├── interfaces/
    │   │   ├── jwt-payload.interface.ts   ← { id, email, roles }
    │   │   ├── auth-user.interface.ts     ← { id, email, fullName, isActive, isVerified, roles }
    │   │   └── index.ts
    │   ├── pipes/
    │   │   └── token-validation/
    │   │       └── token-validation.pipe.ts  ← Validates 6-char alphanumeric reset tokens
    │   └── strategies/
    │       └── jwt.strategy.ts            ← Validates JWT, returns AuthUser (not raw entity)
    ├── user/                              ← User management (CRUD, block/unblock, change password)
    │   ├── user.module.ts
    │   ├── user.controller.ts             ← Protected with @Auth(ValidRoles.ADMIN) at class level
    │   ├── user.service.ts
    │   ├── dto/
    │   │   ├── create-user.dto.ts         ← Includes roles[] as UUID array
    │   │   ├── update-user.dto.ts         ← PartialType(OmitType(CreateUserDto, ['password']))
    │   │   ├── change-password.dto.ts     ← currentPassword + newPassword
    │   │   └── index.ts
    │   └── entities/
    │       └── user.entity.ts             ← ManyToMany with Role, @BeforeInsert email lowercase
    ├── role/                              ← Role entity + CRUD
    ├── email/                             ← Transactional email service (nodemailer)
    │   ├── email.module.ts
    │   └── email.service.ts               ← EMAIL_ENABLED flag, COMPANY_NAME config, template methods
    ├── seed/                              ← Dev-only database seeder
    │   ├── seed.module.ts
    │   ├── seed.controller.ts
    │   ├── seed.service.ts                ← Blocked in production via NODE_ENV check
    │   └── data/
    │       └── seed-data.ts               ← Initial roles + test users
    └── (feature modules go here)          ← project/, page/, locator/, proxy/, etc.
```

## Critical Patterns — Follow These Strictly

### 1. Environment Configuration
Every env var must exist in BOTH `EnvConfiguration()` and `envValidationSchema`. Access via `ConfigService.get<type>('KEY')`.

```typescript
// config/env.config.ts
import * as Joi from 'joi';

export const EnvConfiguration = () => ({
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT || 5432,
  // ... all vars
  EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
  NODE_ENV: process.env.NODE_ENV,
});

export const envValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  // ... all vars with required() or default()
  EMAIL_ENABLED: Joi.boolean().default(true),
  NODE_ENV: Joi.string().default('dev'),
});
```

### 2. Path Aliases
Defined in `tsconfig.json` under `compilerOptions.paths` with `baseUrl: "./src"`. Always use them for cross-module imports:

```typescript
// ✅ Correct
import { HashingAdapter } from '@common/adapters';
import { Auth, GetUser } from '@auth/decorators';
import { User } from '@user/entities/user.entity';

// ❌ Wrong
import { HashingAdapter } from '../../common/adapters';
```

When adding a new module, add its alias to `tsconfig.json`:
```json
"paths": {
  "@auth/*": ["modules/auth/*"],
  "@user/*": ["modules/user/*"],
  "@common/*": ["common/*"],
  "@config/*": ["config/*"],
  "@newmodule/*": ["modules/newmodule/*"]
}
```

### 3. Adapter Pattern
Cross-cutting concerns are injectable services that implement interfaces:

```typescript
// common/interfaces/hashing.adapter.interface.ts
export interface HashingAdapterInterface {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

// common/adapters/hashing-adapter/hashing-adapter.ts
@Injectable()
export class HashingAdapter implements HashingAdapterInterface {
  async hash(password: string): Promise<string> {
    return bcrypt.hashSync(password, 10);
  }
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compareSync(password, hash);
  }
}
```

When creating a new adapter: create the interface in `common/interfaces/`, create the implementation in `common/adapters/{name}-adapter/`, export from barrel files.

### 4. Response Format
`ResponseInterceptor` wraps all responses automatically:
```json
{ "statusCode": 200, "message": "Request successful", "data": { ... } }
```
Messages are auto-generated by HTTP method (POST → "Resource created successfully", GET → "Request successful", etc.).

For custom messages in services, use `HttpResponseMessage`:
```typescript
return HttpResponseMessage.success('Custom message', data, 201);
return HttpResponseMessage.created('Project', projectData);
return HttpResponseMessage.updated('Locator', locatorData);
return HttpResponseMessage.deleted('Page', { id, name });
return HttpResponseMessage.custom('Custom', data, 200);
```

### 5. Error Handling
Three layers:
1. **GlobalExceptionFilter** (global) — catches everything, formats response as `{ statusCode, message, error }`
2. **DatabaseExceptionHandler** (injected in services) — call `this.dbExHandler.handle(error)` in catch blocks for DB operations. Translates duplicates, null violations, FK errors to `BadRequestException`.
3. **Specific exceptions** in service logic — throw `BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException` directly.

```typescript
// Service pattern
constructor(
  private readonly dbExHandler: DatabaseExceptionHandler,
) {}

async create(dto: CreateDto) {
  try {
    // ... business logic
  } catch (error) {
    this.logger.error(`Error creating entity: ${error.message}`);
    this.dbExHandler.handle(error); // translates and rethrows
  }
}
```

### 6. Authentication Architecture
The `@Auth()` decorator is a composition that applies everything in one line:

```typescript
// decorators/auth.decorator.ts
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),
    UseGuards(AuthGuard(), UserRolesGuard),
  );
}

// Usage:
@Auth(ValidRoles.ADMIN)       // Requires admin role
@Auth(ValidRoles.USER)        // Requires user role
@Auth()                        // Requires authentication, any role
```

JWT Strategy validates the token and returns `AuthUser` interface (NOT raw User entity). This is what `@GetUser()` extracts:
```typescript
// AuthUser interface
{ id, email, fullName, isActive, isVerified, roles: string[] }
```

### 7. Email Module Pattern
- Controlled by `EMAIL_ENABLED` env var — when `false`, logs a warning and skips sending
- `COMPANY_NAME` env var used in email templates
- `FRONTEND_URL` env var used to build verification/reset links
- Template methods: `sendVerificationEmail()`, `sendPasswordResetEmail()`, `sendAccountBlockedEmail()`, etc.
- Each template is an HTML string with a `text` fallback generated by stripping HTML tags

### 8. Seed Module Pattern
- Only runs when `NODE_ENV !== 'prod'` and `NODE_ENV !== 'production'` — throws `BadRequestException` otherwise
- Deletes all data then repopulates from `data/seed-data.ts`
- Hashes default passwords, assigns roles, marks users as verified

### 9. Entity Conventions
- `@PrimaryGeneratedColumn('uuid')` for all IDs
- `@BeforeInsert()` and `@BeforeUpdate()` hooks for data normalization (lowercase email, trim)
- Password field: `@Column('text', { select: false })` — never selected by default
- Relationships use explicit `@JoinColumn` or `@JoinTable` with snake_case names
- Business logic methods on entities when appropriate (e.g. `token.isExpired()`)
- Swagger: `@ApiProperty()` with example and description on every exposed column

### 10. DTO Conventions
- All fields use `class-validator` decorators
- `@ApiProperty()` with `example` and `description` on every field
- Passwords validate pattern: `@Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)`
- Password confirmation uses `@Match('password')` custom decorator from `common/decorators/`
- Email fields use `@Transform(({ value }) => value.toLowerCase().trim())` from class-transformer
- `UpdateDto` extends `PartialType(OmitType(CreateDto, ['password']))` — password changes go through dedicated endpoints
- Shared DTOs (like `PaginationDto`) live in `common/dto/`
- Barrel exports in every dto folder

### 11. Service Conventions
- Private `Logger` per service: `private readonly logger = new Logger(ServiceName.name);`
- Every public method wrapped in try/catch
- `this.logger.error(...)` in every catch block with context (entity name, ID, email)
- Rethrow the error after logging — let `GlobalExceptionFilter` handle formatting
- Private helper methods for reusable lookups (`findById`, `findByEmail`, `findRolesExist`)
- Use QueryBuilder for complex queries with selective field loading via `.select([...])`
- Transactions via `entityManager.transaction()` when multiple writes must be atomic

### 12. Controller Conventions
- `@ApiTags('ModuleName')` at class level
- `@ApiBearerAuth()` at class level for protected controllers
- `@Auth(ValidRoles.ADMIN)` at class level when entire controller is admin-only
- `@ApiOperation({ summary: '...' })` on every endpoint
- `@ApiBody`, `@ApiParam`, `@ApiResponse` as appropriate
- `ParseUUIDPipe` for UUID path params
- `@HttpCode(200)` for POST endpoints that don't create resources (login, validate-token)
- Controller methods are thin — delegate all logic to service

### 13. Module Registration
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Entity1, Entity2]),
    ConfigModule,
    forwardRef(() => OtherModule), // Only when circular dependency exists, document why
    // ... other modules
  ],
  controllers: [Controller],
  providers: [Service, HashingAdapter, UuidAdapter],
  exports: [TypeOrmModule, Service], // Export what other modules need
})
```

## main.ts Bootstrap Order
```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: [...], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());
  // Swagger setup with DocumentBuilder
  await app.listen(port);
  logger.log(`App running on port: ${port}`);
}
```

## app.module.ts Structure
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: envValidationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        // ... ssl toggle based on NODE_ENV
        autoLoadEntities: true,
        synchronize: configService.get<string>('NODE_ENV') === 'dev',
      }),
      inject: [ConfigService],
    }),
    // Core modules
    CommonModule,
    AuthModule,
    UserModule,
    RoleModule,
    EmailModule,
    SeedModule,
    // Feature modules
    // ...
  ],
})
```

## Adding a New Module Checklist
1. Create folder: `src/modules/{name}/`
2. Create: `entities/`, `dto/`, `{name}.service.ts`, `{name}.controller.ts`, `{name}.module.ts`
3. If needed: `enums/`, `interfaces/`, `guards/`, `pipes/`, `decorators/`
4. Add path alias `@{name}/*` to `tsconfig.json`
5. Register module in `app.module.ts` imports
6. Inject `DatabaseExceptionHandler` in service if doing DB writes
7. Use `HttpResponseMessage` for all service return values
8. Add Swagger decorators on all endpoints
9. Add barrel exports (`index.ts`) in dto/, entities/, enums/, interfaces/
10. Add seed data to `seed/data/seed-data.ts` if entity needs default records
