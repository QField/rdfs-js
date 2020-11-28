var should = require('should/as-function');

var RDFS;
try {
    RDFS = require('../dist/lib/index');
}
catch (error) {
    RDFS = require('rdfs');
}

describe('Quick example', function () {
    describe('Serialization', function () {
        it('should get RDF document from model', async function () {
            const JSONLD = require('jsonld');
            const model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            const owlThing = model.rdfsClass('owl:Thing');
            const thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');

            const jsonldDoc = thisProject.toJSON();
            const nquads = await JSONLD.toRDF(jsonldDoc, {
                format: 'application/nquads'
            });

            const expectedStatements = [
                '<http://www.w3.org/2000/01/rdf-schema#Class> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/elements/1.1/creator> "Qfield" .'
            ];

            const statements = nquads.trim().split('\n');

            should(statements).have.length(expectedStatements.length);
            should(statements).containDeep(expectedStatements);
            should(expectedStatements).containDeep(statements);
        });
    });

    describe('Deserialization', function () {
        it('should get model from RDF document', async function () {
            const JSONLD = require('jsonld');
            const model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            const rdfDoc = '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/elements/1.1/creator> "Qfield" .\n'
                + '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .\n'
                + '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .\n';

            const jsonldDoc = await JSONLD.fromRDF(rdfDoc, {
                format: 'application/nquads'
            });

            const container = await model.load(jsonldDoc);

            const thisProject = container.get(RDFS.IRI_RDFS_MEMBER).get('rdfs-js');
            should(thisProject.get('dc:creator').valueOf()).equal('Qfield');
            should(thisProject.get(RDFS.IRI_RDF_TYPE).has(model.rdfsResource('owl:Thing'))).be.true();
            const owlThing = thisProject.get(RDFS.IRI_RDF_TYPE).get('owl:Thing');
            should(owlThing.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();
        });
    });
});
