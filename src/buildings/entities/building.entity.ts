import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { string } from 'joi';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { Salad } from './salad.entity';

@InputType() // 인자로 넘기기 위한 타입이라는 것을 알려줌
@ObjectType() // graphql의 Doc을 정의하기 위한 ObjectType
@Entity() // TypeOrm의 Entity 생성을 위한 Decorator
// 빌딩 모델은 세가지 데코레이터를 가지고 있음
export class Building extends CoreEntity {
  // 빌딩의 이름
  @Column({ nullable: false })
  @Field((type) => String)
  name: string;
  // 주소
  @Column({ nullable: false })
  @Field((type) => String)
  address: string;
  // 빌딩 고유 번호, Id 외에 생성되는 기본키, 후보키
  @Field((type) => [User])
  @OneToMany((type) => User, (user) => user.building)
  users: User[];
  // 평균 상주 근로자 수
  @Column({ nullable: false })
  @Field((type) => Number)
  permanentWorker: number;
  // 빌딩의 주문 건수, 일대다의 관계를 가짐
  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.building)
  orders: Order[];
  // 빌딩마다 할당된 메뉴, 일대다의 관계를 가짐
  @Field((type) => [Salad])
  @OneToMany((type) => Salad, (salad) => salad.building)
  menu: Salad[];
  // 빌딩의 이벤트 여부
  @Column({ default: false })
  @Field((type) => Boolean)
  isPromoted: boolean;
  // 빌딩의 이벤트 기간
  @Column({ nullable: true })
  @Field((type) => Date, { nullable: true })
  promotedUntil: Date;
  // 빌딩 코드
  @Column({ nullable: false, unique: true })
  @Field((type) => String, { nullable: false })
  buildingCode: string;
}
