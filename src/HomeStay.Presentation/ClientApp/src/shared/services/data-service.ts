export interface ReadDataService<TEntity> {
  list(): Promise<TEntity[]>;
}

export interface WriteDataService<TEntity> {
  save(entities: TEntity[]): Promise<void>;
}

export type DataService<TEntity> = ReadDataService<TEntity> & WriteDataService<TEntity>;
