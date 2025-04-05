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


const mainComponent = () => ({
    nodes: [],
    paths: [],
    createGraph() {
        const nodes = this.$store.nodes.nodes;
        const paths = this.$store.paths.paths;
        const links = paths.map(item => ({
            source: item.path.source,
            target: item.path.target,
            weight: item.path.weight
        }));

        const svg = d3.select('#graph-svg');

        const width = window.innerWidth, height = window.innerHeight;
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.name).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const node = svg.append('g')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .attr('class', 'node');

        node.append('circle')
            .attr('r', 20)
            .attr('fill', '#69b3a2');

        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 5)
            .text(d => `${d.name}`);

        const link = svg.append('g')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke-width', d => Math.sqrt(d.weight));

        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
    }
});

const controllerComponent = () => ({
    totalNode: 2,
    isFinishRun: false
});


const pathTableComponent = () => ({
    rows: [],
    addRow() {
        this.rows.push({ id: this.rows.length + 1 });
    }
});

const pathRowTableComponent = () => ({
    selectedSource: null,
    selectedTarget: null,
    weight: 0,
    init() {
        this.selectedSource = this.$store.nodes.nodes[0]?.name;
        this.selectedTarget = this.$store.nodes.nodes.find(n => n.name !== this.selectedSource)?.name;
    },
    handleChange() {
        this.$store.paths.addPath(this.row.id, { 
            source: this.selectedSource, 
            target: this.selectedTarget, 
            weight: this.weight 
        });
    }
});