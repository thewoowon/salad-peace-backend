import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Building } from 'src/buildings/entities/building.entity';
import { Salad } from 'src/buildings/entities/salad.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from 'typeorm';

@InputType('CreateAssignmentInput', { isAbstract: true }) // 인자로 넘기기 위한 타입이라는 것을 알려줌
@ObjectType() // graphql의 Doc을 정의하기 위한 ObjectType
@Entity() // TypeOrm의 Entity 생성을 위한 Decorator
export class Assignment extends CoreEntity {
  // 빌딩의 이름
  @Column({ nullable: false })
  @Field((type) => String)
  @IsString()
  name: string;
  // 담당자
  @Field((type) => [User])
  @OneToOne((type) => User)
  manager: User[];

  @Column({ nullable: false })
  @Field((type) => Number)
  total: number;

  @Column({ nullable: false })
  @Field((type) => Building, { nullable: true })
  @ManyToOne(() => Building, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  building: Building;

  @Column({ nullable: false })
  @Field((type) => Salad, { nullable: true })
  @ManyToOne(() => Salad, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  salad: Salad;
}
