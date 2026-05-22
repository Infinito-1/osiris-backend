import { SetMetadata } from '@nestjs/common';

// Chave identificadora para a Metadata do NestJS
export const IS_PUBLIC_KEY = 'isPublic';

// O decorador apenas injeta uma propriedade booleana oculta na rota
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);