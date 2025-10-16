-- Up migration: Create subcategorias table

CREATE TABLE subcategorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    ordem INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subcategorias_categoria_id ON subcategorias(categoria_id);
CREATE INDEX idx_subcategorias_slug ON subcategorias(slug);
CREATE INDEX idx_subcategorias_ativo ON subcategorias(ativo);

-- Trigger for updated_at
CREATE TRIGGER update_subcategorias_updated_at BEFORE UPDATE ON subcategorias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data for DJs
INSERT INTO subcategorias (categoria_id, nome, slug, ordem) VALUES
((SELECT id FROM categorias WHERE slug='dj'), 'House', 'house', 1),
((SELECT id FROM categorias WHERE slug='dj'), 'Techno', 'techno', 2),
((SELECT id FROM categorias WHERE slug='dj'), 'Hardtechno', 'hardtechno', 3),
((SELECT id FROM categorias WHERE slug='dj'), 'UK Garage', 'uk-garage', 4),
((SELECT id FROM categorias WHERE slug='dj'), 'Hip-Hop/Rap', 'hip-hop', 5),
((SELECT id FROM categorias WHERE slug='dj'), 'Funk', 'funk', 6),
((SELECT id FROM categorias WHERE slug='dj'), 'EDM/Electro', 'edm', 7),
((SELECT id FROM categorias WHERE slug='dj'), 'Trance/Psy', 'trance', 8),
((SELECT id FROM categorias WHERE slug='dj'), 'Drum and Bass', 'dnb', 9),
((SELECT id FROM categorias WHERE slug='dj'), 'Breaks/Breakbeat', 'breaks', 10),
((SELECT id FROM categorias WHERE slug='dj'), 'Dubstep/Bass', 'dubstep', 11);

-- Insert initial data for MCs
INSERT INTO subcategorias (categoria_id, nome, slug, ordem) VALUES
((SELECT id FROM categorias WHERE slug='mc'), 'Hip-Hop/Rap', 'mc-hip-hop', 1),
((SELECT id FROM categorias WHERE slug='mc'), 'Funk', 'mc-funk', 2),
((SELECT id FROM categorias WHERE slug='mc'), 'Apresentador', 'apresentador', 3),
((SELECT id FROM categorias WHERE slug='mc'), 'Freestyle', 'freestyle', 4);

-- Insert initial data for Performers
INSERT INTO subcategorias (categoria_id, nome, slug, ordem) VALUES
((SELECT id FROM categorias WHERE slug='performer'), 'Go-Go Dancer', 'go-go', 1),
((SELECT id FROM categorias WHERE slug='performer'), 'Performance Art', 'performance-art', 2),
((SELECT id FROM categorias WHERE slug='performer'), 'Drag Queen/King', 'drag', 3),
((SELECT id FROM categorias WHERE slug='performer'), 'Dançarino', 'dancer', 4);