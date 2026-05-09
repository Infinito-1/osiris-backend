import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTipStrNomeToTipoDemanda1778296304284 implements MigrationInterface {
    name = 'AddTipStrNomeToTipoDemanda1778296304284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grupos" DROP CONSTRAINT "FK_064a9ba06a39a8e0ab7dc4c6791"`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP CONSTRAINT "FK_0f127427244e8a8d493f8b9615c"`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" DROP CONSTRAINT "FK_6be63bea9dac1e801444d718568"`);
        await queryRunner.query(`ALTER TABLE "tipo_demanda" RENAME COLUMN "tip_str_tipStrNome" TO "tip_str_nome"`);
        await queryRunner.query(`CREATE TABLE "admins" ("adm_int_id" SERIAL NOT NULL, "adm_bool_ativo" boolean NOT NULL DEFAULT true, "usu_int_id" integer, CONSTRAINT "REL_26e9f0631b1a83c46b6531b13a" UNIQUE ("usu_int_id"), CONSTRAINT "PK_3aa0cdd5687dd9529cdcd5469cf" PRIMARY KEY ("adm_int_id"))`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP COLUMN "dem_int_semestre_recomendado"`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD "sem_int_id" integer`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD "dem_data_criacao" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD "dem_bool_ativo" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD "sem_int_id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."usuario_usu_str_tipo_enum" RENAME TO "usuario_usu_str_tipo_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_usu_str_tipo_enum" AS ENUM('Empreendedor', 'Coordenador', 'Grupo', 'Admin')`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "usu_str_tipo" TYPE "public"."usuario_usu_str_tipo_enum" USING "usu_str_tipo"::"text"::"public"."usuario_usu_str_tipo_enum"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_usu_str_tipo_enum_old"`);
        await queryRunner.query(`ALTER TABLE "candidaturas" DROP COLUMN "can_str_status"`);
        await queryRunner.query(`CREATE TYPE "public"."candidaturas_can_str_status_enum" AS ENUM('Pendente', 'Aceita', 'Recusada')`);
        await queryRunner.query(`ALTER TABLE "candidaturas" ADD "can_str_status" "public"."candidaturas_can_str_status_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tipo_demanda" ADD CONSTRAINT "UQ_39dbad8bd660cdac6b4279cb262" UNIQUE ("tip_str_nome")`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" DROP COLUMN "hsp_date_data"`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" ADD "hsp_date_data" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" DROP CONSTRAINT "REL_6be63bea9dac1e801444d71856"`);
        await queryRunner.query(`ALTER TABLE "admins" ADD CONSTRAINT "FK_26e9f0631b1a83c46b6531b13a1" FOREIGN KEY ("usu_int_id") REFERENCES "usuario"("usu_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD CONSTRAINT "FK_6d1d97beb3fef280a2095fe625b" FOREIGN KEY ("sem_int_id") REFERENCES "semestres"("sem_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD CONSTRAINT "FK_676fafdd9d0d5b289fc6ebdc338" FOREIGN KEY ("sem_int_id") REFERENCES "semestres"("sem_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" ADD CONSTRAINT "FK_6be63bea9dac1e801444d718568" FOREIGN KEY ("pro_int_id") REFERENCES "projeto"("pro_int_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" DROP CONSTRAINT "FK_6be63bea9dac1e801444d718568"`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP CONSTRAINT "FK_676fafdd9d0d5b289fc6ebdc338"`);
        await queryRunner.query(`ALTER TABLE "grupos" DROP CONSTRAINT "FK_6d1d97beb3fef280a2095fe625b"`);
        await queryRunner.query(`ALTER TABLE "admins" DROP CONSTRAINT "FK_26e9f0631b1a83c46b6531b13a1"`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" ADD CONSTRAINT "REL_6be63bea9dac1e801444d71856" UNIQUE ("pro_int_id")`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" DROP COLUMN "hsp_date_data"`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" ADD "hsp_date_data" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "tipo_demanda" DROP CONSTRAINT "UQ_39dbad8bd660cdac6b4279cb262"`);
        await queryRunner.query(`ALTER TABLE "candidaturas" DROP COLUMN "can_str_status"`);
        await queryRunner.query(`DROP TYPE "public"."candidaturas_can_str_status_enum"`);
        await queryRunner.query(`ALTER TABLE "candidaturas" ADD "can_str_status" character varying(50) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."usuario_usu_str_tipo_enum_old" AS ENUM('Empreendedor', 'Coordenador', 'Grupo')`);
        await queryRunner.query(`ALTER TABLE "usuario" ALTER COLUMN "usu_str_tipo" TYPE "public"."usuario_usu_str_tipo_enum_old" USING "usu_str_tipo"::"text"::"public"."usuario_usu_str_tipo_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."usuario_usu_str_tipo_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."usuario_usu_str_tipo_enum_old" RENAME TO "usuario_usu_str_tipo_enum"`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP COLUMN "sem_int_id"`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP COLUMN "dem_bool_ativo"`);
        await queryRunner.query(`ALTER TABLE "demandas" DROP COLUMN "dem_data_criacao"`);
        await queryRunner.query(`ALTER TABLE "grupos" DROP COLUMN "sem_int_id"`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD "dem_int_semestre_recomendado" integer`);
        await queryRunner.query(`DROP TABLE "admins"`);
        await queryRunner.query(`ALTER TABLE "tipo_demanda" RENAME COLUMN "tip_str_nome" TO "tip_str_tipStrNome"`);
        await queryRunner.query(`ALTER TABLE "historico_status_projeto" ADD CONSTRAINT "FK_6be63bea9dac1e801444d718568" FOREIGN KEY ("pro_int_id") REFERENCES "projeto"("pro_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "demandas" ADD CONSTRAINT "FK_0f127427244e8a8d493f8b9615c" FOREIGN KEY ("dem_int_semestre_recomendado") REFERENCES "semestres"("sem_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grupos" ADD CONSTRAINT "FK_064a9ba06a39a8e0ab7dc4c6791" FOREIGN KEY ("gru_int_id") REFERENCES "semestres"("sem_int_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
