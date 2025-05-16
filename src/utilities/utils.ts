export async function mapResponse(responseToMap) {
    return responseToMap.map(data => {
        const plainData = data.get({ plain: true });
        if (plainData.created) {
            plainData.created = new Date(plainData.created);
        }
        return plainData;
    });
}

export async function mapResponseFromCache(responseToMap) {

    return responseToMap.map(data => {
        data.created = new Date(data.created);
        return data;
    });
}

export function ExecutionTime() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const start = Date.now();
            console.log(`[${propertyKey}] Execution started`);

            try {
                const result = await originalMethod.apply(this, args);
                const executionTime = Date.now() - start;
                console.log(`[${propertyKey}] Execution completed in ${executionTime}ms`);
                return result;
            } catch (error) {
                const executionTime = Date.now() - start;
                console.log(`[${propertyKey}] Execution failed after ${executionTime}ms`);
                throw error;
            }
        };

        return descriptor;
    };
}