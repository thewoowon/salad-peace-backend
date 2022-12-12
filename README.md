# Salad Peace Back-End
<p>
  <img src="https://img.shields.io/badge/Node.js-16.13.1-green" alt="NestJs"/>
  <img src="https://img.shields.io/badge/Nest.js-8.2.6-red" alt="NodeJs"/>
  <img src="https://img.shields.io/badge/GraphQL-16.6.0-orange" alt="GraphQL"/>
  <img src="https://img.shields.io/badge/Apollo-3.10.2-blueviolet" alt="Apollo"/>
  <img src="https://img.shields.io/badge/TypeORM-0.3.10-red" alt="TypeORM"/>
  <img src="https://img.shields.io/badge/PG-8.8.0-blue" alt="PG"/>
  <img src="https://img.shields.io/badge/ESLint-8.0.1-green" alt="PG"/>
  <img src="https://img.shields.io/badge/Prettier-2.3.2-green" alt="PG"/>
</p>

## Slogan
> ### 샐러드 생활에 평화를

## Logo
![saladPeace](https://user-images.githubusercontent.com/60413257/203082132-552ff113-f747-46cb-8ecf-6a1a7136c00f.png)

## Feature
- 샐러드 피스의 판매 전략은 빌딩 단위 판매입니다.
- 샐러드 피스는 거점 빌딩에 당일 판매 예정인 샐러드 개수를 할당합니다.
- 샐러드는 실시간으로 선착순으로 판매됩니다.
- 당일 오전 11시 이전에 주문한 샐러드는 당일 오후 1시 이전 배송이 원칙입니다.
- 개인이 구매 가능한 샐러드 개수는 최대 5개입니다.
- 구매한 샐러드는 해당 거점 빌딩의 층마다 구비되어 있는 샐러드 박스에 배송됩니다.
- 남은 샐러드는 당일 폐기가 원칙입니다.
- 샐러드는 빌딩의 상주 인원 데이터를 바탕으로 미리 수요를 예측하고 최적의 개수를 할당합니다.
- 샐러드는 선착순 결제이므로 결제 시 취소가 불가능합니다.

## Getting Started
> git clone https://github.com/thewoowon/salad-peace-backend.git

## Module

### Basic
- ConfigModule
- GraphQLModule
- TypeOrmModule
- ScheduleModule

### Custom
- UsersModule
- JwtModule
- MailModule
- BuildingsModule
- AuthModule
- OrdersModule
- CommonModule
- PaymentsModule
- UploadsModule
- AssignmentModule

## Service
- UsersService
- JwtService
- MailService
- BuildingsService
- OrdersService
- PaymentsService
- AssignmentsService

## Entity
- User
- Verification
- Building
- Category
- Salad
- Order
- OrderItem
- Payment
- Assignment

## Mailing
- MailGun

## Image Storage
- AWS S3

## Code Convetion
- ESLint

## Test
- Jest
- SuperTest

## DataBase
- PostgreSQL

## ORM
- TypeORM

## Subscription
- GraphQL Subscriptions

