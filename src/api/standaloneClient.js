/**
 * StandaloneClient.js - A drop-in replacement for @base44/sdk
 * This allows the app to run completely independent of any backend by using localStorage.
 */

const STORAGE_PREFIX = 'kw_winner_local_';

const getLocal = (key, defaultValue = null) => {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : (defaultValue || []);
};

const setLocal = (key, value) => {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};

// Initial Data Seeding
const seedData = () => {
    if (!localStorage.getItem(STORAGE_PREFIX + 'ExclusiveKeyword')) {
        const initialKeywords = [
            { id: 'local_1', keyword_phrase: 'Silicone Stretch Lids', price: 149, search_volume: 12500, competing_products: 450, opportunity_score: 92, status: 'available', created_at: new Date().toISOString() },
            { id: 'local_2', keyword_phrase: 'Reusable Coffee Filters', price: 199, search_volume: 8400, competing_products: 320, opportunity_score: 88, status: 'available', created_at: new Date().toISOString() },
            { id: 'local_3', keyword_phrase: 'Bamboo Dish Brushes', price: 129, search_volume: 15600, competing_products: 1200, opportunity_score: 85, status: 'available', created_at: new Date().toISOString() },
            { id: 'local_4', keyword_phrase: 'Organic Cotton Produce Bags', price: 179, search_volume: 9200, competing_products: 580, opportunity_score: 90, status: 'sold', sold_at: new Date().toISOString(), created_at: new Date().toISOString() },
        ];
        setLocal('ExclusiveKeyword', initialKeywords);
    }
};

seedData();

class EntityProxy {
    constructor(name) {
        this.name = name;
    }

    async list() {
        return getLocal(this.name);
    }

    async get(id) {
        const items = getLocal(this.name);
        return items.find(i => i.id === id);
    }

    async create(data) {
        const items = getLocal(this.name);
        const newItem = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString()
        };
        items.push(newItem);
        setLocal(this.name, items);
        return newItem;
    }

    async update(id, data) {
        const items = getLocal(this.name);
        const index = items.findIndex(i => i.id === id);
        if (index > -1) {
            items[index] = { ...items[index], ...data };
            setLocal(this.name, items);
            return items[index];
        }
        throw new Error('Entity not found');
    }

    async delete(id) {
        const items = getLocal(this.name);
        const filtered = items.filter(i => i.id !== id);
        setLocal(this.name, filtered);
        return { success: true };
    }

    async filter(params) {
        let items = getLocal(this.name);
        Object.entries(params).forEach(([key, value]) => {
            items = items.filter(i => i[key] === value);
        });
        return items;
    }
}

export const createStandaloneClient = () => {
    return {
        auth: {
            me: async () => {
                // Return a persistent local user
                const user = getLocal('user', {
                    id: 'admin_local',
                    email: 'admin@local.test',
                    name: 'Local Admin',
                    role: 'admin'
                });
                setLocal('user', user);
                return user;
            },
            logout: () => {
                localStorage.removeItem(STORAGE_PREFIX + 'user');
                window.location.reload();
            },
            redirectToLogin: () => {
                alert('Authentication is handled locally in Standalone Mode.');
            }
        },
        entities: new Proxy({}, {
            get: (target, name) => new EntityProxy(name)
        }),
        functions: {
            invoke: async (name, payload) => {
                console.log(`Standalone Invoking Function: ${name}`, payload);

                // Mock specific functions
                if (name === 'createExclusiveCheckout') {
                    // Simulate Stripe redirect
                    return { data: { 
                        message: 'MOCK',
                        checkout_url: `${window.location.origin}/ExclusiveKeywords?mock_success=true&keyword_ids=${payload.keyword_ids}` 
                    } };
                }

                return { data: { success: true, message: 'Fuction executed locally (MOCK)' } };
            }
        },
        appLogs: {
            logUserInApp: async (page) => {
                console.log(`Standalone Logging Page View: ${page}`);
                return { success: true };
            }
        }
    };
};
