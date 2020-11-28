var should = require('should/as-function');

var RDFS;
try {
    RDFS = require('../dist/lib/index');
}
catch (error) {
    RDFS = require('rdfs');
}

describe('Model', function () {
    describe('#expandIRI(resourceIRI)', function () {
        it('should return expanded IRI', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#'
                }
            );

            should(model.expandIRI('rdf:type')).equal(RDFS.IRI_RDF + 'type');
            should(model.expandIRI('owl:Thing')).equal('http://www.w3.org/2002/07/owl#Thing');
            should(model.expandIRI('_:1')).equal('_:1');
            should(model.expandIRI('rdfs-js')).equal('http://qfield.net/example/ns#rdfs-js');

            done();
        });
    });

    describe('#defineClass(classIRI[, superClassIRI])', function () {
        it('should return "owl:Class a rdfs:Class."', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#'
                }
            );

            var owlClass = model.defineClass('owl:Class');

            should(owlClass.IRI).equal('http://www.w3.org/2002/07/owl#Class');
            should(owlClass.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();
            should(owlClass.has(RDFS.IRI_RDFS_SUBCLASSOF, model.rdfsClass)).be.false();

            done();
        });

        it('should return "owl:Class a rdfs:Class; rdfs:subClassOf rdfs:Class."', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#'
                }
            );

            var owlClass = model.defineClass('owl:Class', model.rdfsClass);

            should(owlClass.IRI).equal('http://www.w3.org/2002/07/owl#Class');
            should(owlClass.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();
            should(owlClass.get(RDFS.IRI_RDFS_SUBCLASSOF).has(model.rdfsClass)).be.true();

            done();
        });

        it('should return a blank node as a rdfs:Class', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#'
                }
            );

            var blankNode;

            should(function () {
                blankNode = model.defineClass('_:b1');
            }).throw(Error);

            blankNode = model.defineClass();

            should(blankNode).not.have.property('IRI');
            should(blankNode.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();

            done();
        });
    });

    describe('#defineProperty(domain, propertyIRI[, range])', function () {
        it('should not override builtin properties');

        it('should return a rdfs:Property without value binding', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var dcCreator = model.defineProperty(model.rdfsResource, 'dc:creator', [
                model.rdfsDatatype('xsd:string'),
                model.rdfLangString
            ]);

            should(dcCreator.IRI).equal('http://purl.org/dc/elements/1.1/creator');
            should(model.rdfsResource.has('dc:creator')).be.false();

            done();
        });

        it('should accept subjects in domain', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var list = model.rdfList();
            var resource = model.rdfsResource();

            model.defineProperty(model.rdfList, 'dc:creator', [
                model.rdfsDatatype('xsd:string'),
                model.rdfLangString
            ]);

            should(function () {
                resource.set('dc:creator', 'Qfield');
            }).throw(Error);

            list.set('dc:creator', 'Qfield');
            should(list.get('dc:creator').get()).equal('Qfield');

            done();
        });

        it('should accept objects in range', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var resource = model.rdfsResource();

            model.defineProperty(model.rdfsResource, 'dc:creator', [
                model.rdfsDatatype('xsd:string'),
                model.rdfLangString
            ]);

            resource.set('dc:creator', 'Qfield');
            should(resource.get('dc:creator').get()).equal('Qfield');

            var localeLabel = model.rdfLangString('资源@zh-CN');
            resource.set('dc:creator', localeLabel);
            should(resource.has('dc:creator', localeLabel)).be.true();

            should(function () {
                resource.set('dc:creator', 0);
            }).throw(Error);

            should(function () {
                resource.set('dc:creator', resource);
            }).throw(Error);

            done();
        });
    });

    describe('#useStrict', function () {
        it('should infer subject type in domain', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/',
                    'foaf': 'http://xmlns.com/foaf/0.1/'
                }
            );

            should(model.useStrict).be.true();

            model.useStrict = false;

            should(model.useStrict).be.false();

            var resourceA = model.rdfsResource();
            var resourceB = model.rdfsResource();
            var project = model.rdfsResource('foaf:Project');

            model.defineProperty(project, 'dc:creator', model.rdfsDatatype('xsd:string'));

            resourceA.set('dc:creator', 'Qfield');

            should(resourceA.get(RDFS.IRI_RDF_TYPE).has(project)).be.true();

            model.useStrict = true;

            should(model.useStrict).be.true();

            should(function () {
                resourceB.set('dc:creator', 'Qfield');
            }).throw(Error);

            should(resourceB.get(RDFS.IRI_RDF_TYPE).has(project)).be.false();

            should(resourceB.has('dc:creator')).be.false();

            resourceB.set(RDFS.IRI_RDF_TYPE, project);

            resourceB.set('dc:creator', 'Qfield');

            should(resourceB.get(RDFS.IRI_RDF_TYPE).has(project)).be.true();

            should(resourceB.get('dc:creator').has('Qfield')).be.true();

            done();
        });

        it('should infer object type in range', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/',
                    'foaf': 'http://xmlns.com/foaf/0.1/'
                }
            );

            should(model.useStrict).be.true();

            model.useStrict = false;

            should(model.useStrict).be.false();

            var resource = model.rdfsResource();
            var agent = model.rdfsResource('foaf:Agent');
            var project = model.rdfsResource('foaf:Project');
            var qfield = model.rdfsResource('qfield');

            model.defineProperty(project, 'dc:creator', agent);

            should(function () {
                resource.set('dc:creator', 'Qfield');
            }).throw(Error);

            should(agent.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();

            resource.set('dc:creator', qfield);

            should(qfield.get(RDFS.IRI_RDF_TYPE).has(agent)).be.true();

            should(resource.get(RDFS.IRI_RDF_TYPE).has(project)).be.true();

            done();
        });
    });

    describe('#load(source, callback)', function () {
        it('should load source into a container', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var rdfDoc = [
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/elements/1.1/creator> "Qfield" .',
                '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                '_:1 <http://www.w3.org/2000/01/rdf-schema#label> "Test blank node" .'
            ];

            JSONLD.fromRDF(rdfDoc.join('\n'), {
                format: 'application/nquads'
            }).then(function (jsonldDoc) {
                model.load(jsonldDoc, function (error, container) {
                    var thisProject;
                    var owlThing;

                    should.ifError(error);

                    thisProject = container.get(RDFS.IRI_RDFS_MEMBER).get('rdfs-js');
                    should(thisProject.get('dc:creator').get()).equal('Qfield');
                    should(thisProject.get(RDFS.IRI_RDF_TYPE).has(model.rdfsResource('owl:Thing'))).be.true();
                    owlThing = thisProject.get(RDFS.IRI_RDF_TYPE).get('owl:Thing');
                    should(owlThing.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();

                    var hasBlankNode = container.get(RDFS.IRI_RDFS_MEMBER).some((resource) => {
                        var result;
                        if (resource['IRI'] === undefined) {
                            result = (resource.get('rdfs:label').get() === 'Test blank node');
                        }
                        else {
                            result = false;
                        }
                        return (result);
                    });
                    should(hasBlankNode).be.true();
                    done();
                });
            }, function (error) {
                should.ifError(error);
                done();
            });
        });

        it('should load source into a container (async)', async function () {
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

            const rdfDoc = [
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/elements/1.1/creator> "Qfield" .',
                '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .'
            ];

            const jsonldDoc = await JSONLD.fromRDF(rdfDoc.join('\n'), {
                format: 'application/nquads'
            });

            const container = await model.load(jsonldDoc);

            const thisProject = container.get(RDFS.IRI_RDFS_MEMBER).get('rdfs-js');
            should(thisProject.get('dc:creator').get()).equal('Qfield');
            should(thisProject.get(RDFS.IRI_RDF_TYPE).has(model.rdfsResource('owl:Thing'))).be.true();
            const owlThing = thisProject.get(RDFS.IRI_RDF_TYPE).get('owl:Thing');
            should(owlThing.get(RDFS.IRI_RDF_TYPE).has(model.rdfsClass)).be.true();
        });

        it('should load javascript datatype from source into a container', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD
                }
            );

            var rdfDoc = [
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasInteger> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasBoolean> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasFloat> "1.1"^^<http://www.w3.org/2001/XMLSchema#float> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDouble> "1.0E-1"^^<http://www.w3.org/2001/XMLSchema#double> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasString> "text" .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasLangString> "text"@en-us .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDate> "2017-08-21Z"^^<http://www.w3.org/2001/XMLSchema#date> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDateTime> "2017-08-21T10:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                '<http://qfield.net/example/ns#example> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .'
            ];

            JSONLD.fromRDF(rdfDoc.join('\n'), {
                format: 'application/nquads'
            }).then(function (jsonldDoc) {
                model.load(jsonldDoc, function (error, container) {
                    var example;
                    var value;

                    should.ifError(error);

                    example = container.get(RDFS.IRI_RDFS_MEMBER).get('example');

                    should(example.get('hasInteger').valueOf()).equal(0);
                    should(example.get('hasBoolean').valueOf()).equal(true);
                    should(example.get('hasFloat').valueOf()).equal(1.1);
                    should(example.get('hasDouble').valueOf()).equal(0.1);
                    should(example.get('hasString').valueOf()).equal('text');
                    should(example.get('hasLangString').valueOf()).equal('text');
                    value = example.get('hasDate').valueOf();
                    should(value instanceof Date).be.true();
                    should(value.getTime()).equal(Date.parse('2017-08-21'));
                    value = example.get('hasDateTime').valueOf();
                    should(value instanceof Date).be.true();
                    should(value.getTime()).equal(Date.parse('2017-08-21T10:00:00.000Z'));

                    done();
                });
            }, function (error) {
                should.ifError(error);
                done();
            });
        });

        it('should load literal resource from source into a container', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD
                }
            );

            var rdfDoc = [
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasLiteral> "text" .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDataset> _:b0 .',
                '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://qfield.net/example/ns#Dataset> .',
                '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .',
                '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "<dataset/>" .',
                '<http://qfield.net/example/ns#Dataset> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasLangString> "text"@en-us .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasHTML> "<html/>"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML> .',
                '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasXMLLiteral> "<xml/>"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .',
                '<http://qfield.net/example/ns#example> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .'
            ];

            JSONLD.fromRDF(rdfDoc.join('\n'), {
                format: 'application/nquads'
            }).then(function (jsonldDoc) {
                model.load(jsonldDoc, function (error, container) {
                    var example;
                    var literal;

                    should.ifError(error);

                    example = container.get(RDFS.IRI_RDFS_MEMBER).get('example');

                    should(example.get('hasLiteral').get()).equal('text');
                    literal = example.get('hasDataset').get();
                    should(literal.get(RDFS.IRI_RDF_VALUE).get()).equal('<dataset/>');
                    should(literal.get(RDFS.IRI_RDF_TYPE).has(model.rdfsDatatype('Dataset'))).be.true();
                    should(literal.get(RDFS.IRI_RDF_TYPE).has(model.rdfXMLLiteral)).be.true();
                    literal = example.get('hasLangString').get();
                    should(literal.get(RDFS.IRI_RDF_VALUE).get()).equal('text@en-us');
                    should(literal.get(RDFS.IRI_RDF_TYPE).has(model.rdfLangString)).be.true();
                    literal = example.get('hasHTML').get();
                    should(literal.get(RDFS.IRI_RDF_VALUE).get()).equal('<html/>');
                    should(literal.get(RDFS.IRI_RDF_TYPE).has(model.rdfHTML)).be.true();
                    literal = example.get('hasXMLLiteral').get();
                    should(literal.get(RDFS.IRI_RDF_VALUE).get()).equal('<xml/>');
                    should(literal.get(RDFS.IRI_RDF_TYPE).has(model.rdfXMLLiteral)).be.true();

                    done();
                });
            }, function (error) {
                should.ifError(error);
                done();
            });
        });
    });

    describe('#save(callback[, options])', function () {
        it('should save resources in model except builtin terms', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/terms/'
                }
            );

            var created = model.rdfsLiteral('2017-08-10Z', model.xsdDate);
            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');
            thisProject.set('dc:created', created);

            var modified = model.rdfsLiteral('2017-08-10T21:00:00Z', model.xsdDateTime);
            thisProject.set('dc:modified', modified);

            var blankNode = model.rdfsResource();
            blankNode.set('rdfs:label', 'Test blank node');

            model.save(function (error, jsonldDoc) {
                should.ifError(error);
                JSONLD.toRDF(jsonldDoc, {
                    format: 'application/nquads'
                }).then(function (nquads) {
                    var statements;
                    var expectedStatements;

                    expectedStatements = [
                        '<http://purl.org/dc/terms/creator> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://purl.org/dc/terms/creator> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://purl.org/dc/terms/modified> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://purl.org/dc/terms/modified> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://purl.org/dc/terms/created> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://purl.org/dc/terms/created> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/creator> "Qfield" .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/created> "2017-08-10Z"^^<http://www.w3.org/2001/XMLSchema#date> .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/modified> "2017-08-10T21:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                        '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                        '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '_:b0 <http://www.w3.org/2000/01/rdf-schema#label> "Test blank node" .'
                    ];

                    statements = nquads.trim().split('\n');
                    should(statements).have.length(expectedStatements.length);

                    should(statements).containDeep(expectedStatements);
                    should(expectedStatements).containDeep(statements);

                    done();
                }, function (error) {
                    should.ifError(error);
                    done();
                });
            });
        });

        it('should save resources in model except builtin terms (async)', async function () {
            const JSONLD = require('jsonld');
            const model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/terms/'
                }
            );

            const created = model.rdfsLiteral('2017-08-10Z', model.xsdDate);
            const owlThing = model.rdfsClass('owl:Thing');
            const thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');
            thisProject.set('dc:created', created);

            const modified = model.rdfsLiteral('2017-08-10T21:00:00Z', model.xsdDateTime);
            thisProject.set('dc:modified', modified);

            const jsonldDoc = await model.save();

            const sameJsonldDoc = await model.save({ 'exclude': ['built-in'] });

            const nquads = await JSONLD.toRDF(jsonldDoc, {
                format: 'application/nquads'
            });

            const sameNquads = await JSONLD.toRDF(sameJsonldDoc, {
                format: 'application/nquads'
            });

            const expectedStatements = [
                '<http://purl.org/dc/terms/creator> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                '<http://purl.org/dc/terms/creator> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                '<http://purl.org/dc/terms/modified> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                '<http://purl.org/dc/terms/modified> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                '<http://purl.org/dc/terms/created> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                '<http://purl.org/dc/terms/created> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/creator> "Qfield" .',
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/created> "2017-08-10Z"^^<http://www.w3.org/2001/XMLSchema#date> .',
                '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/modified> "2017-08-10T21:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .'
            ];

            const statements = nquads.trim().split('\n');
            const sameStatements = sameNquads.trim().split('\n');

            should(statements).have.length(expectedStatements.length);
            should(statements).have.length(sameStatements.length);

            should(statements).containDeep(expectedStatements);
            should(expectedStatements).containDeep(statements);

            should(statements).containDeep(sameStatements);
            should(sameStatements).containDeep(statements);
        });

        it('should save resources in model except class and property definitions', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/terms/'
                }
            );

            var modified = model.rdfsLiteral('2017-08-10T21:00:00Z', model.xsdDateTime);
            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');
            thisProject.set('dc:modified', modified);
            var created = model.rdfsLiteral('2017-08-10T21:00:00Z', model.xsdDateTime);
            thisProject.set('dc:created', created);

            model.save(function (error, jsonldDoc) {
                should.ifError(error);
                JSONLD.toRDF(jsonldDoc, {
                    format: 'application/nquads'
                }).then(function (nquads) {
                    var statements;
                    var expectedStatements;

                    expectedStatements = [
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/creator> "Qfield" .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/created> "2017-08-10T21:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/terms/modified> "2017-08-10T21:00:00Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                        '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .'
                    ];

                    statements = nquads.trim().split('\n');
                    should(statements).have.length(expectedStatements.length);

                    should(statements).containDeep(expectedStatements);
                    should(expectedStatements).containDeep(statements);

                    done();
                }, function (error) {
                    should.ifError(error); done();
                });
            }, {
                'exclude': [
                    'built-in',
                    /#Thing$/,
                    function (resource) {
                        var result;
                        var typeofResource = resource.get(RDFS.IRI_RDF_TYPE);
                        if (typeofResource === undefined) {
                            result = false;
                        }
                        else {
                            result = typeofResource.has(model.rdfProperty);
                        }
                        return (result);
                    }
                ]
            });
        });

        it('should save javascript datatype in model', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD
                }
            );

            var example = model.rdfsResource('example');
            example.set('hasInteger', 0);
            example.set('hasDouble', 0.1);
            example.set('hasDate', new Date('2017-08-12'));
            example.set('hasBoolean', true);
            example.set('hasString', 'text');

            model.save(function (error, jsonldDoc) {
                should.ifError(error);
                JSONLD.toRDF(jsonldDoc, {
                    format: 'application/nquads'
                }).then(function (nquads) {
                    var statements;
                    var expectedStatements;

                    expectedStatements = [
                        '<http://qfield.net/example/ns#hasInteger> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasInteger> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasString> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasString> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasBoolean> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasBoolean> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasDouble> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasDouble> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasDate> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasDate> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasInteger> "0"^^<http://www.w3.org/2001/XMLSchema#integer> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasBoolean> "true"^^<http://www.w3.org/2001/XMLSchema#boolean> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDouble> "1.0E-1"^^<http://www.w3.org/2001/XMLSchema#double> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasString> "text" .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDate> "2017-08-12T00:00:00.000Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .',
                        '<http://qfield.net/example/ns#example> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .'
                    ];

                    statements = nquads.trim().split('\n');
                    should(statements).have.length(expectedStatements.length);

                    should(statements).containDeep(expectedStatements);
                    should(expectedStatements).containDeep(statements);

                    done();
                }, function (error) {
                    should.ifError(error);
                    done();
                });
            });
        });

        it('should save literal resource in model', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD
                }
            );

            var example = model.rdfsResource('example');
            example.set('hasLiteral', model.rdfsLiteral('text'));
            example.set('hasLangString', model.rdfLangString('text@en-US'));
            example.set('hasHTML', model.rdfHTML('<html/>'));
            example.set('hasXMLLiteral', model.rdfXMLLiteral('<xml/>'));
            example.set('hasDataset', model.rdfXMLLiteral('<dataset/>', [
                model.rdfsClass('Dataset')
            ]));
            example.set('hasCustomLiteral', model.rdfsLiteral('1', model.rdfsDatatype('unit')));

            model.save(function (error, jsonldDoc) {
                should.ifError(error);
                JSONLD.toRDF(jsonldDoc, {
                    format: 'application/nquads'
                }).then(function (nquads) {
                    var statements;
                    var expectedStatements;

                    expectedStatements = [
                        '<http://qfield.net/example/ns#unit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Datatype> .',
                        '<http://qfield.net/example/ns#hasLiteral> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasLiteral> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasCustomLiteral> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasCustomLiteral> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasLangString> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasLangString> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasHTML> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasHTML> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasXMLLiteral> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasXMLLiteral> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#hasDataset> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .',
                        '<http://qfield.net/example/ns#hasDataset> <http://www.w3.org/2000/01/rdf-schema#domain> <http://www.w3.org/2000/01/rdf-schema#Resource> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasLiteral> "text" .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasCustomLiteral> "1"^^<http://qfield.net/example/ns#unit> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasDataset> _:b0 .',
                        '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://qfield.net/example/ns#Dataset> .',
                        '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .',
                        '_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#value> "<dataset/>" .',
                        '<http://qfield.net/example/ns#Dataset> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasLangString> "text"@en-us .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasHTML> "<html/>"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#HTML> .',
                        '<http://qfield.net/example/ns#example> <http://qfield.net/example/ns#hasXMLLiteral> "<xml/>"^^<http://www.w3.org/1999/02/22-rdf-syntax-ns#XMLLiteral> .',
                        '<http://qfield.net/example/ns#example> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .'
                    ];

                    statements = nquads.trim().split('\n');
                    should(statements).have.length(expectedStatements.length);

                    should(statements).containDeep(expectedStatements);
                    should(expectedStatements).containDeep(statements);

                    done();
                }, function (error) {
                    should.ifError(error);
                    done();
                });
            });
        });
    });

    describe('#extend(properties)', function () {
        it('should extend model property with loaded resources', function (done) {
            var JSONLD = require('jsonld');
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#'
                }
            );

            var rdfDoc = [
                '<http://www.w3.org/2002/07/owl#Class> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Resource> .'
            ];

            JSONLD.fromRDF(rdfDoc.join('\n'), {
                format: 'application/nquads'
            }).then(function (jsonldDoc) {
                model.load(jsonldDoc, function (error) {
                    var count;

                    should.ifError(error);

                    count = model.extend({
                        'http://www.w3.org/2002/07/owl#Thing': 'owlThing',
                        'owl:Class': 'owlClass'
                    });
                    should(count).equal(2);
                    should(model).have.property('owlThing');
                    should(model).have.property('owlClass');
                    should(model.owlThing.has('rdf:type', model.rdfsResource)).be.true();
                    should(model.owlClass.has('rdf:type', model.rdfsClass)).be.true();
                    done();
                });
            }, function (error) {
                should.ifError(error);
                done();
            });
        });
    });

    describe('#get(resourceIRI)', function () {
        it('should get specified named resources in model', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');

            should(model.get('owl:Thing')).equal(owlThing);
            done();
        });
    });

    describe('#forEach(callback[, options])', function () {
        it('should get all named resources in model', function (done) {
            var expectedResources = new Set();
            var expectedBuiltinTerms = 0;
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');

            expectedResources.add(model.expandIRI('owl:Thing'));
            expectedResources.add(model.expandIRI('rdfs-js'));
            expectedResources.add(model.expandIRI('dc:creator'));

            model.forEach(function (resource, resourceIRI) {
                if (expectedResources.has(resourceIRI) === false) {
                    expectedBuiltinTerms += 1;
                }
                else {
                    expectedResources.delete(resourceIRI);
                }
            }, {
                'exclude': []
            });

            should(expectedBuiltinTerms).equal(70);
            should(expectedResources.size).equal(0);
            done();
        });

        it('should get all named resources in model except builtin terms', function (done) {
            var expectedResources = new Set();
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                    'dc': 'http://purl.org/dc/elements/1.1/'
                }
            );

            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');

            expectedResources.add(model.expandIRI('owl:Thing'));
            expectedResources.add(model.expandIRI('rdfs-js'));
            expectedResources.add(model.expandIRI('dc:creator'));

            model.forEach(function (resource, resourceIRI) {
                if (expectedResources.has(resourceIRI) === false) {

                }
                else {
                    expectedResources.delete(resourceIRI);
                }
            });

            should(expectedResources.size).equal(0);
            done();
        });
    });
});
