import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';
import { Building } from './building.entity';

@InputType('SaladChoiceInputType', { isAbstract: true })
@ObjectType()
export class SaladChoice {
  @Field((type) => String, { nullable: true })
  name?: string;

  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('SaladOptionInputType', { isAbstract: true })
@ObjectType()
export class SaladOption {
  @Field((type) => String)
  name: string;
  @Field((type) => [SaladChoice], { nullable: true })
  choices?: SaladChoice[];
  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('SaladInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Salad extends CoreEntity {
  // 데이터 베이스와 상호 작용 할 수 있는 장치인 BaseEntity

  @Field((type) => String)
  @Column({ unique: true })
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field((type) => String)
  @Column()
  @Length(5, 140)
  description: string;

  @Field((type) => Building, { nullable: true })
  @ManyToOne(() => Building, (building) => building.menu, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  building: Building;

  @RelationId((salad: Salad) => salad.building)
  buildingId: number;

  @Field((type) => [SaladOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: SaladOption[];
}
