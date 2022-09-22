import { CoreEntity } from 'src/common/entities/core.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm';
import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { Building } from 'src/buildings/entities/building.entity';

export enum UserRole {
  Client = 'Client',
  Master = 'Master',
  Delivery = 'Delivery',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  // 사용자 이름
  @Column({ nullable: true })
  @Field((type) => String)
  name: string;
  // 사용자 이메일
  @Column({ unique: true })
  @Field((type) => String)
  email: string;
  // 사용자 비밀번호
  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;
  //사용자 역할
  @Column({ type: 'enum', enum: UserRole })
  @Field((type) => UserRole)
  @IsEnum(UserRole)
  role: UserRole;
  // 사용자 인증 여부
  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;
  // 사용자 빌딩
  // 빌딩이 사라진다고 해서 사용자의 아이디가 사라지면 안된다.
  @Field((type) => Building, { nullable: true })
  @ManyToOne((type) => Building, (building) => building.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  building: Building;
  // 관계를 형성하는 엔티티에는 @RelationId() 데코레이터를 사용하여 관계를 형성하는 엔티티의 id를 가져올 수 있다.
  @RelationId((user: User) => user.building)
  buildingId: number;
  // 사용자 주문
  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.customer)
  orders: Order[];
  //사용자 결제
  @Field((type) => [Payment])
  @OneToMany((type) => Payment, (payment) => payment.user, { eager: true })
  payments: Payment[];
  // 사용자 배송 현황
  @Field((type) => [Order])
  @OneToMany((type) => Order, (order) => order.driver)
  rides: Order[];
  // 계정 업데이트 이전, 계정 생성 이전, 수행햐하는 것
  @BeforeUpdate()
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
