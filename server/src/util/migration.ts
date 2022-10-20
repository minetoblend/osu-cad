export abstract class Migrator<BaseType extends Versioned, Latest extends BaseType, Extra = any> {

    abstract getMigrations(): Migration<BaseType, BaseType, Extra>[];

    constructor() {
        this.migrations = this.getMigrations()
    }

    private readonly migrations: Migration<BaseType, BaseType, Extra>[]

    get latestVersion() {
        return this.migrations.length + 1
    }

    isLatestVersion(object: BaseType): boolean {
        return object.version === this.latestVersion
    }

    migrateToLatest(object: BaseType): Latest {
        while (object.version < this.latestVersion) {
            this.migrateToNextVersion(object)
        }
        return object as Latest
    }

    migrateToNextVersion(object: BaseType): BaseType {
        const migration = this.migrations[object.version - 1]
        object = migration.call(this, object)
        return object
    }
}

export type Migration<From extends Versioned, To extends Versioned, Extra> = (object: From, extra: Extra) => To;

export interface Versioned<Version extends number = number> {
    version: Version
}