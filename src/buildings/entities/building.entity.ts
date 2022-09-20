import { Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, OneToMany, OneToOne } from 'typeorm';
import { Salad } from './salad.entity';

@ObjectType()
export class Building extends CoreEntity {
  @Field((type) => String)
  name: string;

  @Field((type) => String)
  address: string;
  // 빌딩 고유 번호
  @Field((type) => Number)
  @OneToOne((type) => User, (user) => user.building)
  buildingCode: number;
  // 상주 근로자 수
  @Field((type) => Number)
  permanentWorker: number;

  @Field((type) => [Salad])
  @OneToMany((type) => Salad, (salad) => salad.building)
  menu: Salad[];

  @Field((type) => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field((type) => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;
}
