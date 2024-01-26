use serde_json::{Map, Value};
use strum::IntoEnumIterator;
use std::collections::BTreeMap;
use std::sync::Mutex;

pub struct CatalogueState {
    data: Mutex<LoadedCatalogue>
}

impl CatalogueState {
    pub fn new() -> Self {
        CatalogueState{ data: Mutex::from(LoadedCatalogue::new()) }
    }

    pub fn load_catalogue(&self, (items_type, new_catalogue): (CatalogueItemType, Map<String, Value>)) {
        self.data.lock().unwrap().load_catalogue(items_type, &new_catalogue);
    }

    pub fn add_item(&self, item_type: CatalogueItemType, item: &Value) {
        self.data.lock().unwrap().add_item(item_type, item);
    }

    pub fn query_item(&self, item_type: CatalogueItemType, query: String) -> Value {
        self.data.lock().unwrap().find_items(item_type, query)
    }

    pub fn get_item(&self, item_type: CatalogueItemType, item_name: String) -> Value {
        self.data.lock().unwrap().get_item(item_type, item_name)
    }

    pub fn export_current_catalogues(&self) -> Vec<(CatalogueItemType, Value)> {
        self.data.lock().unwrap().export()
    }
}

#[derive(PartialEq, Eq, PartialOrd, Ord, strum_macros::EnumIter, Clone, Copy)]
pub enum CatalogueItemType {
    Item,
    Spell,
}

impl ToString for CatalogueItemType {
    fn to_string(&self) -> String {
        match self {
            CatalogueItemType::Item => "spell",
            CatalogueItemType::Spell => "item",
        }.to_string()
    }
}

impl From<&str> for CatalogueItemType {
    fn from(value: &str) -> Self {
        match value {
            "spell" => CatalogueItemType::Spell,
            "item" => CatalogueItemType::Item,
            _ => CatalogueItemType::Item,
        }
    }
}

struct LoadedCatalogue {
    catalogues: BTreeMap<CatalogueItemType, Map<String, Value>>
}

impl LoadedCatalogue {
    pub fn new() -> Self {
        let mut cat = LoadedCatalogue {
            catalogues: BTreeMap::new(),
        };
        for item_type in CatalogueItemType::iter() {
            cat.catalogues.insert(item_type, Map::new());
        }
        cat
    }

    pub fn load_catalogue(&mut self, items_type: CatalogueItemType, new_catalogue: &Map<String, Value>) {
        todo!()
    }

    pub fn add_item(&mut self, item_type: CatalogueItemType, new_item: &Value) {
        todo!()
    }

    pub fn find_items(&self, item_type: CatalogueItemType, query: String) -> Value {
        todo!();
    }

    pub fn get_item(&self, item_type: CatalogueItemType, item_name: String) -> Value {
        todo!();
    }

    pub fn export(&self) -> Vec<(CatalogueItemType, Value)> {
        todo!()
    }
}

