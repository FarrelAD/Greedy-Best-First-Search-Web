document.addEventListener('alpine:init', () => {
    Alpine.store('nodes', {
        nodes: [],
        addNode(id, name) {
            const index = this.nodes.findIndex(item => item.id === id);

            if (index === -1) {
                return this.nodes.push({ id: id, name: name })
            }

            this.nodes[index].name = name;
        }
    });

    Alpine.store('paths', {
        paths: [],
        addPath(id, path) {
            const index = this.paths.findIndex(path => path.id === id);

            if (index === -1) {
                return this.paths.push({ 
                    id: id,
                    path: path
                });
            }

            this.paths[index].path = path;
        }
    });
});