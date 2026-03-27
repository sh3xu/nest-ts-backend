## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
# NestJS Standards

- Always use the latest stable NestJS packages when adding or updating dependencies.
- Follow official NestJS community best practices and recommended patterns.
    - Always use Controller → Service → Repository pattern
    - Controllers should contain no business logic
    - Services should contain business logic only
    - Repositories should handle database queries
    - DTOs must be used for all request/response data
    - Entities should never be returned directly
    - Use modules to keep features isolated
    - Follow feature-based modular structure
    - Follow DRY principle
    - Use NestJS Logger / Avoid console.log
    - Use versioned APIs
- Never use loose methods or loose typing when a strict, explicit approach is available.
- When in doubt, consult and follow the official NestJS documentation: https://docs.nestjs.com/
- For NestJS API and function usage references, use: https://api-references-nestjs-v10.netlify.app/api
- Prioritize scalable, long-term architecture with flexibility, modularity, and reusability.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
