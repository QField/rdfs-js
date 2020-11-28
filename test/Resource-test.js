var should = require('should/as-function');

var RDFS;
try {
    RDFS = require('../dist/lib/index');
}
catch (error) {
    RDFS = require('rdfs');
}

describe('Resource', function () {
    describe('.constructor(resourceIRI[, resourceTypes])', function () {
        it('should return a named rdfs:Resource', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                }
            );

            var resource = model.rdfsResource('rdfs-js');

            should(resource).have.property('IRI');
            should(resource.toString()).equal('Resource <http://qfield.net/example/ns#rdfs-js>');

            done();
        });

        it('should return a blank node', function (done) {
            var model = new RDFS.Model(
                'http://qfield.net/example/ns#',
                {
                    'rdf': RDFS.IRI_RDF,
                    'rdfs': RDFS.IRI_RDFS,
                    'xsd': RDFS.IRI_XSD,
                    'owl': 'http://www.w3.org/2002/07/owl#',
                }
            );

            var blankNode;

            should(function () {
                blankNode = model.rdfsResource('_:b1');
            }).throw(Error);

            blankNode = model.rdfsResource();
            should(blankNode).not.have.property('IRI');
            should(blankNode.toString()).equal('Resource');

            done();
        });
    });

    describe('#has(propertyIRI[, value])', function () {
        it('should return true if relationship exists', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            should(resource.has('rdfs:label')).be.false();
            should(resource.has('dc:creator')).be.true();
            should(resource.has('dc:format')).be.true();
            should(resource.has('dc:creator', 'Qfield')).be.true();
            should(resource.has('dc:creator', 'Q-field')).be.false();
            should(resource.has('dc:format', format)).be.true();
            should(resource.has('dc:format', model.rdfsResource())).be.false();

            done();
        });
    });

    describe('#get(propertyIRI)', function () {
        it('should return a BindingProperty instance if relationship exists', function (done) {
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

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', 'Qfield');

            var bp1 = resource.get('dc:creator');
            should(bp1).have.property('property');
            should(bp1.property['IRI']).equal('http://purl.org/dc/elements/1.1/creator');
            should(bp1.get()).equal('Qfield');

            var bp2 = resource.get(model.rdfProperty('dc:creator'));
            should(bp2).equal(bp1);

            done();
        });

        it('should return undefined if relationship does not exist', function (done) {
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

            var resource = model.rdfsResource('this-example');

            var bindingProperty = resource.get('missing');
            should(bindingProperty).be.undefined();

            bindingProperty = resource.get(model.rdfProperty('missing'));
            should(bindingProperty).be.undefined();

            done();
        });
    });

    describe('#set(propertyIRI, value)', function () {
        it('should add relationship by property', function (done) {
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

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', ['Qfield', 'Q-field'])
                .set('dc:created', new Date('2017-08-14'));

            var bp = resource.get('dc:creator');

            var expectedValues = ['Qfield', 'Q-field'];
            var values = [];
            var count = 0;

            bp.forEach(function (value) {
                values.push(value);
                count += 1;
            });

            should(count).equal(expectedValues.length);

            should(values).containDeep(expectedValues);
            should(expectedValues).containDeep(values);
            should(resource.get('dc:created').valueOf().getTime()).equal(Date.parse('2017-08-14'));

            done();
        });
    });

    describe('#defineProperty(propertyIRI[, range])', function () {
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

            var dcCreator = model.rdfsResource.defineProperty('dc:creator', [
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

            model.rdfList.defineProperty('dc:creator', [
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

            model.rdfsResource.defineProperty('dc:creator', [
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

    describe('#delete(propertyIRI)', function () {
        it('should remove the relationship by property', function (done) {
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

            var resource = model.rdfsResource('this-example');
            resource.set('dc:creator', 'Qfield');

            var bp = resource.get('dc:creator');
            should(bp).have.property('property');
            should(bp.property['IRI']).equal('http://purl.org/dc/elements/1.1/creator');
            should(bp.get()).equal('Qfield');

            resource.delete('dc:creator');
            should(resource.has('dc:creator')).be.false();

            resource.delete('dc:creator');
            should(resource.has('dc:creator')).be.false();

            done();
        });
    });

    describe('#some(callback)', function () {
        it('should return all relationships from the resource', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            var relationships = {};
            var count = 0;

            should(resource.some(function (bp) {
                relationships[bp['property']['IRI']] = bp.get();
                count += 1;
            })).be.false();

            should(count).equal(3);

            var expectedRelationships = {
                'http://purl.org/dc/elements/1.1/creator': 'Qfield',
                'http://purl.org/dc/elements/1.1/format': format
            };

            expectedRelationships[RDFS.IRI_RDF_TYPE] = model.rdfsResource;

            should(relationships).containDeep(expectedRelationships);
            should(expectedRelationships).containDeep(relationships);

            done();
        });

        it('should break if callback returns true', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            var expectedRelationships = {
                'http://purl.org/dc/elements/1.1/creator': 'Qfield'
            };

            var relationships = {};

            should(resource.some(function (bp) {
                var bpIRI = bp['property']['IRI'];
                var result = (bpIRI === 'http://purl.org/dc/elements/1.1/creator');
                if (result === false) {
                    result = undefined;
                }
                else {
                    relationships[bpIRI] = bp.get();
                }
                return (result);
            })).be.true();

            should(relationships).containDeep(expectedRelationships);
            should(expectedRelationships).containDeep(relationships);

            done();
        });
    });

    describe('#every(callback)', function () {
        it('should return all relationships from the resource', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            var relationships = {};
            var count = 0;

            should(resource.every(function (bp) {
                relationships[bp['property']['IRI']] = bp.get();
                count += 1;
                return (true);
            })).be.true();

            should(count).equal(3);

            var expectedRelationships = {
                'http://purl.org/dc/elements/1.1/creator': 'Qfield',
                'http://purl.org/dc/elements/1.1/format': format
            };

            expectedRelationships[RDFS.IRI_RDF_TYPE] = model.rdfsResource;

            should(relationships).containDeep(expectedRelationships);
            should(expectedRelationships).containDeep(relationships);

            done();
        });

        it('should break if callback returns not true', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            var expectedRelationships = {
                'http://purl.org/dc/elements/1.1/creator': 'Qfield'
            };

            var relationships = {};

            should(resource.every(function (bp) {
                var bpIRI = bp['property']['IRI'];
                var result = (bpIRI !== 'http://purl.org/dc/elements/1.1/creator');
                if (result === false) {
                    relationships[bpIRI] = bp.get();
                    result = undefined;
                }
                else {

                }
                return (result);
            })).be.false();

            should(relationships).containDeep(expectedRelationships);
            should(expectedRelationships).containDeep(relationships);

            done();
        });
    });

    describe('#forEach(callback)', function () {
        it('should return all relationships from the resource', function (done) {
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

            var resource = model.rdfsResource('this-example');
            var format = model.rdfsClass('text/javascript');
            resource.set('dc:creator', 'Qfield');
            resource.set('dc:format', format);

            var relationships = {};
            var count = 0;

            resource.forEach(function (bp) {
                relationships[bp['property']['IRI']] = bp.get();
                count += 1;
            });

            should(count).equal(3);

            var expectedRelationships = {
                'http://purl.org/dc/elements/1.1/creator': 'Qfield',
                'http://purl.org/dc/elements/1.1/format': format
            };

            expectedRelationships[RDFS.IRI_RDF_TYPE] = model.rdfsResource;

            should(relationships).containDeep(expectedRelationships);
            should(expectedRelationships).containDeep(relationships);

            done();
        });
    });

    describe('#valueOf()', function () {
        it('should return self when resource does not have a rdf:value', function (done) {
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
            should(resource.valueOf()).equal(resource);

            done();
        });

        it('should return primitive type value when resource can be converted (no constraint guard)', function (done) {
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

            var literal;

            literal = model.rdfLangString('text@en-us');
            should(literal.valueOf()).equal('text');

            literal = model.rdfsLiteral('1', model.xsdDecimal);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('1.1', model.xsdFloat);
            should(literal.valueOf()).equal(1.1);

            literal = model.rdfsLiteral('1e+10', model.xsdDouble);
            should(literal.valueOf()).equal(1e+10);

            literal = model.rdfsLiteral('1', model.xsdInteger);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('1', model.xsdByte);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('1', model.xsdShort);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('1', model.xsdInt);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('1', model.xsdLong);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('9999999999999999', model.xsdLong);
            should(function () {
                literal.valueOf();
            }).throw(RangeError);

            literal = model.rdfsLiteral('1', model.xsdNonNegativeInteger);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdNonNegativeInteger);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdUnsignedByte);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdUnsignedByte);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdUnsignedShort);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdUnsignedShort);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdUnsignedInt);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdUnsignedInt);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdUnsignedLong);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdUnsignedLong);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('9999999999999999', model.xsdUnsignedLong);
            should(function () {
                literal.valueOf();
            }).throw(RangeError);

            literal = model.rdfsLiteral('1', model.xsdPositiveInteger);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdPositiveInteger);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdNegativeInteger);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdNegativeInteger);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdNonPositiveInteger);
            should(literal.valueOf()).equal(1);

            literal = model.rdfsLiteral('-1', model.xsdNonPositiveInteger);
            should(literal.valueOf()).equal(-1);

            literal = model.rdfsLiteral('1', model.xsdBoolean);
            should(literal.valueOf()).equal(true);

            literal = model.rdfsLiteral('0', model.xsdBoolean);
            should(literal.valueOf()).equal(false);

            literal = model.rdfsLiteral('true', model.xsdBoolean);
            should(literal.valueOf()).equal(true);

            literal = model.rdfsLiteral('false', model.xsdBoolean);
            should(literal.valueOf()).equal(false);

            literal = model.rdfsLiteral('False', model.xsdBoolean);
            should(function () {
                literal.valueOf();
            }).throw(RangeError);

            literal = model.rdfsLiteral('2017-01-01', model.xsdDate);
            should(literal.valueOf().getTime()).equal(Date.parse('2017-01-01'));

            literal = model.rdfsLiteral('2017-01-01T10:00:00', model.xsdDateTime);
            should(literal.valueOf().getTime()).equal(Date.parse('2017-01-01T10:00:00'));

            literal = model.rdfsLiteral('2017-01-01T10:00:00+12:00', model.xsdDateTimeStamp);
            should(literal.valueOf().getTime()).equal(Date.parse('2017-01-01T10:00:00+12:00'));

            done();
        });
    });

    describe('#toString()', function () {
        it('should return "Resource" for blank node', function (done) {
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
            should(resource.toString()).equal('Resource');

            done();
        });

        it('should return "Resource <...>" for named node', function (done) {
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

            var resource = model.rdfsResource('named-node');
            should(resource.toString()).equal('Resource <http://qfield.net/example/ns#named-node>');

            done();
        });
    });

    describe('#toJSON', function () {
        it('should return rdfs:Resource as JSONLD', function (done) {
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

            var owlThing = model.rdfsClass('owl:Thing');
            var thisProject = owlThing('rdfs-js');
            thisProject.set('dc:creator', 'Qfield');

            var jsonldDoc = thisProject.toJSON();

            JSONLD.toRDF(jsonldDoc, {
                format: 'application/nquads'
            }).then(function (nquads) {
                var expectedStatements = [
                    '<http://www.w3.org/2000/01/rdf-schema#Class> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                    '<http://www.w3.org/2002/07/owl#Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .',
                    '<http://qfield.net/example/ns#rdfs-js> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2002/07/owl#Thing> .',
                    '<http://qfield.net/example/ns#rdfs-js> <http://purl.org/dc/elements/1.1/creator> "Qfield" .'
                ];

                var statements = nquads.trim().split('\n');

                should(statements).have.length(4);
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
