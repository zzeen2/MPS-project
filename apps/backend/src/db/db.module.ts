import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { db, pool } from './client';

@Global()
@Module({
<<<<<<< HEAD
    providers: [{ provide: 'DB', useValue: db }],
    exports: ['DB'],
})
export class DbModule implements OnModuleDestroy {
    async onModuleDestroy() {
        await pool.end();
    }
}
=======
  providers: [{ provide: 'DB', useValue: db }],
  exports: ['DB'],
})
export class DbModule implements OnModuleDestroy {
  async onModuleDestroy() { await pool.end(); }
}

>>>>>>> client
