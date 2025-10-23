class EventBus {
    constructor() {
        this.events = {};
    }

    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        // Return unsubscribe function
        return () => {
            this.events[eventName] = this.events[eventName].filter(
                cb => cb !== callback
            );
        };
    }

    publish(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => {
            callback(data);
        });
    }

    unsubscribeAll(eventName) {
        if (this.events[eventName]) {
            delete this.events[eventName];
        }
    }
}

// Create a singleton instance
const eventBus = new EventBus();
export default eventBus;