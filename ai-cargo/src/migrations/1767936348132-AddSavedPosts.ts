import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSavedPosts1767936348132 implements MigrationInterface {
    name = 'AddSavedPosts1767936348132'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_a42a5e0e01f57fa8effa570a8ab"`);
        await queryRunner.query(`CREATE TABLE "posts_saved_by_user" ("postsId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_e6685ea8ab5284a1d1bfb6508d7" PRIMARY KEY ("postsId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_9105d73df459ca8b3f31c9ede4" ON "posts_saved_by_user" ("postsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0a23a374a1aeda28c262440629" ON "posts_saved_by_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "savedId"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "createAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts_saved_by_user" ADD CONSTRAINT "FK_9105d73df459ca8b3f31c9ede4c" FOREIGN KEY ("postsId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "posts_saved_by_user" ADD CONSTRAINT "FK_0a23a374a1aeda28c262440629f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts_saved_by_user" DROP CONSTRAINT "FK_0a23a374a1aeda28c262440629f"`);
        await queryRunner.query(`ALTER TABLE "posts_saved_by_user" DROP CONSTRAINT "FK_9105d73df459ca8b3f31c9ede4c"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "createAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "savedId" integer`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0a23a374a1aeda28c262440629"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9105d73df459ca8b3f31c9ede4"`);
        await queryRunner.query(`DROP TABLE "posts_saved_by_user"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_a42a5e0e01f57fa8effa570a8ab" FOREIGN KEY ("savedId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
